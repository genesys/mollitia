import { Module, ModuleOptions } from '../index.js';
import { Circuit, CircuitFunction } from '../../circuit.js';
import { SerializableRecord } from '../../helpers/serializable.js';
type ErrorCallback = (err: any) => boolean;

type BreakerResultResponse = {
  requestResult: SlidingWindowRequestResult;
  response: any;
  shouldReportFailure: boolean;
};

/**
 * Returned when a breaker module is in open state.
 * @param message Circuit is opened
 */
export class BreakerError extends Error {
  constructor() {
    super('Circuit is opened');
    Object.setPrototypeOf(this, BreakerError.prototype);
  }
}

/**
 * Returned when a breaker module is in half-open state and the maximum number of requests in half-open has been sent.
 * @param message Max allowed requests reached
 */
export class BreakerMaxAllowedRequestError extends Error {
  constructor() {
    super('Max allowed requests reached');
    Object.setPrototypeOf(this, BreakerError.prototype);
  }
}

/**
 * Breaker states.
 */
export enum BreakerState {
  CLOSED = 'closed',
  HALF_OPENED = 'half-opened',
  OPENED = 'opened'
}

/**
 * Properties that customizes the sliding window breaker behavior.
 */
export abstract class SlidingWindowBreakerOptions extends ModuleOptions {
  /**
   * Specifies the circuit state
   */
  state?: BreakerState;
  /**
   * Specifies the time (in ms) the circuit stay opened before switching to half-open
   */
  openStateDelay?: number;
  /**
   * Specifies the maximum wait (in ms) in Half Open State, before switching back to open. 0 deactivates this
   */
  halfOpenStateMaxDelay?: number;
  /**
   * Specifies the maximum number of calls (if count breaker is user),
   * or the sliding duration (in ms, if time breaker is used) used to calculate failure and slow call rate percentages
   */
  slidingWindowSize?: number;
  /**
   * Specifies the minimum number of calls used to calculate failure and slow call rate percentages
   */
  minimumNumberOfCalls?: number;
  /**
   * Specifies the failure rate threshold in percentage
   */
  failureRateThreshold?: number;
  /**
   * Specifies the slow call rate threshold. A call is considered as slow when the call duration is greater than slowCallDurationThreshold
   */
  slowCallRateThreshold?: number;
  /**
   * Specifies the duration (in ms) threshold above which calls are considered as slow
   */
  slowCallDurationThreshold?: number;
  /**
   * Specifies the number of permitted calls when the circuit is half open
   */
  permittedNumberOfCallsInHalfOpenState?: number;
  /**
   * Allows filtering of the error to report as a failure or not.
   */
  onError?: ErrorCallback;
}

export enum SlidingWindowRequestResult {
  SUCCESS =  0,
  FAILURE =  1,
  TIMEOUT =  2
}

export interface SlidingRequest extends SerializableRecord {
  result: SlidingWindowRequestResult,
  timestamp?: number
}

export interface SlidingState extends SerializableRecord {
  state: BreakerState,
  timestamp: number
}

export abstract class SlidingWindowBreaker extends Module {
  // Public Attributes
  /**
   * Specifies the circuit state
   */
  public state: BreakerState;
  /**
   * Specifies when the circuit state was set
   */
  public stateTimestamp: number;
  /**
   * Specifies the time (in ms) the circuit stay opened before switching to half-open
   */
  public openStateDelay: number;
  /**
   * Specifies the maximum wait (in ms) in Half Open State, before switching back to open. 0 deactivates this
   */
  public halfOpenStateMaxDelay: number;
  /**
   * Specifies the maximum number of calls (if count breaker is user),
   * or the sliding duration (in ms, if time breaker is used) used to calculate failure and slow call rate percentages
   */
  public slidingWindowSize: number;
  /**
   * Specifies the minimum number of calls used to calculate failure and slow call rate percentages
   */
  public minimumNumberOfCalls: number;
  /**
   * Specifies the failure rate threshold in percentage
   */
  public failureRateThreshold: number;
  /**
   * Specifies the slow call rate threshold. A call is considered as slow when the call duration is greater than slowCallDurationThreshold
   */
  public slowCallRateThreshold: number;
  /**
   * Specifies the duration (in ms) threshold above which calls are considered as slow
   */
  public slowCallDurationThreshold: number;
  /**
   * Specifies the number of permitted calls when the circuit is half open
   */
  public permittedNumberOfCallsInHalfOpenState: number;
  /**
   * Allows filtering of the error to report as a failure or not.
   */
  public onError: ErrorCallback;
  // Private Attributes
  private halfOpenMaxDelayTimeout = 0;
  private openTimeout = 0;
  public nbRequestsInHalfOpenedState: number;
  public requests: SlidingRequest[];
  private isInitialized = false;

  constructor (options?: SlidingWindowBreakerOptions) {
    super(options);
    this.state = (options?.state !== undefined) ? options.state : BreakerState.CLOSED;
    this.stateTimestamp = Date.now();
    this.openStateDelay = (options?.openStateDelay !== undefined) ? options.openStateDelay : 60 * 1000;
    this.halfOpenStateMaxDelay = (options?.halfOpenStateMaxDelay !== undefined) ? options.halfOpenStateMaxDelay : 0;
    this.slidingWindowSize = (options?.slidingWindowSize !== undefined) ? options.slidingWindowSize : 10;
    this.minimumNumberOfCalls = (options?.minimumNumberOfCalls !== undefined) ? options.minimumNumberOfCalls : 10;
    this.failureRateThreshold = (options?.failureRateThreshold !== undefined) ? options.failureRateThreshold : 50;
    this.slowCallDurationThreshold = (options?.slowCallDurationThreshold !== undefined) ? options.slowCallDurationThreshold : 60000;
    this.slowCallRateThreshold = (options?.slowCallRateThreshold !== undefined) ? options?.slowCallRateThreshold : 100;
    this.permittedNumberOfCallsInHalfOpenState =
      (options?.permittedNumberOfCallsInHalfOpenState !== undefined) ? options.permittedNumberOfCallsInHalfOpenState : 2;
    this.nbRequestsInHalfOpenedState = 0;
    this.requests = [];
    this.onError = options?.onError || (() => true);
  }

  private reinitializeCounters (): void {
    this.nbRequestsInHalfOpenedState = 0;
    this.requests = [];
  }
  public onOpened(): void {
    this.reinitializeCounters();
  }

  public onClosed(): void {
    this.reinitializeCounters();
  }

  public onHalfOpened(): void {
    this.reinitializeCounters();
  }

  private isSomeEnum<T extends object>(obj: T, possibleValue: any): possibleValue is T[keyof T] {
    return Object.values(obj).includes(possibleValue);
  }

  private isValidTimestamp(data: object): boolean {
    return !('timestamp' in data) || ('timestamp' in data && typeof (data.timestamp) === 'number');
  }

  private isValidState(data: unknown): data is SlidingState {
    return !!(
      data &&
      typeof (data) === 'object' &&
      ('state' in data && this.isSomeEnum(BreakerState, data.state)) &&
      this.isValidTimestamp(data)
    );
  }

  private isValidRequest(data: unknown): data is SlidingRequest {
    return !!(
      data &&
      typeof(data) === 'object' &&
      ('result' in data && this.isSomeEnum(SlidingWindowRequestResult, data.result)) &&
      this.isValidTimestamp(data)
    );
  }

  private isValidData(data: SerializableRecord): data is { requests?: SlidingRequest[], state?: SlidingState } {
    return (
      (!data.state || this.isValidState(data.state)) &&
      (!data.requests || (Array.isArray(data.requests) && !data.requests.some((req) => !this.isValidRequest(req))))
    );
  }

  public async execute<T>(circuit: Circuit, promise: CircuitFunction, ...params: any[]): Promise<T> {
    try {
      const data = await this.getState();
      if (this.isValidData(data)) {
        this.requests = data.requests ?
          (data.requests.map((r) => r.timestamp ? { result: r.result, timestamp: r.timestamp } : { result: r.result })) :
          [];
        if (data.state) {
          this.state = data.state.state;
          this.stateTimestamp = data.state.timestamp;
        }
      }
    } catch (e) {
      console.warn('Cannot get state');
    }
    if (!this.isInitialized) {
      this.isInitialized = true;
      if (this.state === BreakerState.OPENED) {
        await this.setHalfDelay();
      } else if (this.state === BreakerState.HALF_OPENED) {
        await this.setOpenDelay();
      }
    }
    const _exec = this._promiseBreaker<T>(circuit, promise, ...params);
    const _params = this.getExecParams(circuit, params);
    this.emit('execute', circuit, _exec, _params);
    return _exec;
  }
  private async _promiseBreaker<T> (circuit: Circuit, promise: CircuitFunction, ...params: any[]): Promise<T> {
    switch (this.state) {
      case BreakerState.OPENED:
        this.logger?.debug(`${circuit.name}/${this.name} - Circuit is opened`);
        return Promise.reject(new BreakerError());
      case BreakerState.HALF_OPENED:
        return this.executeInHalfOpened<T>(promise, ...params);
      case BreakerState.CLOSED:
      default:
        return this.executeInClosed<T>(promise, ...params);
    }
  }

  abstract executeInClosed<T> (promise: CircuitFunction, ...params: any[]): Promise<T>;

  protected adjustRequestResult(requestResult: SlidingWindowRequestResult, shouldReportFailure: boolean): SlidingWindowRequestResult {
    if (!shouldReportFailure && requestResult === SlidingWindowRequestResult.FAILURE) {
      return SlidingWindowRequestResult.SUCCESS;
    }
    return requestResult;
  }

  protected async setStateSecure(state: SerializableRecord[], ttl?: number): Promise<void> {
    try {
      await this.setState(state, ttl);
    } catch (e) {
      console.warn('Cannot set the state');
    }
  }

  protected async executeInHalfOpened<T>(promise: CircuitFunction, ...params: any[]): Promise<T> {
    if (this.nbRequestsInHalfOpenedState < this.permittedNumberOfCallsInHalfOpenState) {
      this.nbRequestsInHalfOpenedState++;
      const { requestResult, response, shouldReportFailure } = await this.executePromise(promise, ...params);
      this.requests.push({ result: this.adjustRequestResult(requestResult, shouldReportFailure) });
      await this.setStateSecure([ { key: 'requests', value: this.requests } ]);
      if (this.requests.length == this.permittedNumberOfCallsInHalfOpenState) {
        this.checkCallRatesHalfOpen(this.open.bind(this), this.close.bind(this));
      }
      if (requestResult === SlidingWindowRequestResult.FAILURE) {
        return Promise.reject(response);
      } else {
        return Promise.resolve(response);
      }
    } else {
      return Promise.reject(new BreakerMaxAllowedRequestError());
    }
  }
  protected executePromise(promise: CircuitFunction, ...params: any[]): Promise<BreakerResultResponse> {
    const beforeRequest = (new Date()).getTime();
    return promise(...params)
      .then((res) => {
        const afterRequest = (new Date()).getTime();
        let requestResp = SlidingWindowRequestResult.SUCCESS;
        if (this.slowCallDurationThreshold !== 0 && this.slowCallDurationThreshold !== Infinity) {
          if ((afterRequest - beforeRequest) > this.slowCallDurationThreshold) {
            requestResp = SlidingWindowRequestResult.TIMEOUT;
          }
        }
        return {requestResult: requestResp, response: res, shouldReportFailure: false};
      })
      .catch((err) => {
        return {requestResult: SlidingWindowRequestResult.FAILURE, response: err, shouldReportFailure: this.onError(err)};
      });
  }

  protected checkCallRatesHalfOpen(callbackFailure: (() => void), callbackSuccess?: (() => void)): void {
    const { nbSlow, nbFailure } = this.requests.reduce(this.getNbSlowAndFailure, { nbSlow: 0, nbFailure: 0 });
    const result = this.checkResult(nbSlow, nbFailure, this.requests.length);
    if (result) {
      if (callbackSuccess) {
        callbackSuccess();
      }
    } else {
      callbackFailure();
    }
  }

  private checkResult(nbSlow: number, nbFailure: number, nbCalls: number): boolean {
    return !(
      (this.slowCallRateThreshold < 100 && (((nbSlow / nbCalls) * 100) >= this.slowCallRateThreshold)) ||
      (this.failureRateThreshold < 100 && (((nbFailure / nbCalls) * 100) >= this.failureRateThreshold))
    );
  }

  protected getNbSlowAndFailure(acc: {nbSlow: number, nbFailure: number}, current: SlidingRequest): {nbSlow: number, nbFailure: number} {
    switch(current.result) {
      case SlidingWindowRequestResult.FAILURE:
        acc.nbFailure++;
        break;
      case SlidingWindowRequestResult.TIMEOUT:
        acc.nbSlow++;
    }
    return acc;
  }

  protected checkCallRatesClosed(): boolean {
    const {nbSlow, nbFailure} = this.requests.reduce(this.getNbSlowAndFailure, {nbSlow: 0, nbFailure: 0});
    return this.checkResult(nbSlow, nbFailure, this.requests.length);
  }

  public async open(): Promise<void> {
    if (this.state !== BreakerState.OPENED) {
      this.clearHalfOpenTimeout();
      this.state = BreakerState.OPENED;
      this.stateTimestamp = Date.now();
      this.setHalfDelay();
      this.onOpened();
      await this.setStateSecure([
        { key: 'state', value: { state: BreakerState.OPENED, timestamp: Date.now() } },
        { key: 'requests', value: '' }
      ]);
      this.emit('state-changed', this.state);
    }
  }
  public async halfOpen(): Promise<void> {
    if (this.state !== BreakerState.HALF_OPENED) {
      this.clearHalfOpenTimeout();
      this.state = BreakerState.HALF_OPENED;
      this.stateTimestamp = Date.now();
      this.setOpenDelay();
      this.onHalfOpened();
      await this.setStateSecure([
        { key: 'state', value: { state: BreakerState.HALF_OPENED, timestamp: Date.now() } },
        { key: 'requests', value: '' }
      ]);
      this.emit('state-changed', this.state);
    }
  }
  public async close(): Promise<void> {
    if (this.state !== BreakerState.CLOSED) {
      this.clearHalfOpenTimeout();
      this.state = BreakerState.CLOSED;
      this.stateTimestamp = Date.now();
      this.onClosed();
      try {
        await this.setStateSecure([
          { key: 'state', value: { state: BreakerState.CLOSED, timestamp: Date.now() } },
          { key: 'requests', value: '' }
        ]);
      } catch (e) {
        console.warn('Timeout while setting state');
      }
      this.emit('state-changed', this.state);
    }
  }
  private async setHalfDelay(): Promise<void> {
    const timeInCurrentState = Date.now() - this.stateTimestamp;
    if (timeInCurrentState >= this.openStateDelay) {
      this.logger?.debug(`${this.name} - Breaker: Half Open`);
      await this.halfOpen();
    } else {
      this.openTimeout = <unknown>setTimeout(async () => {
        this.logger?.debug(`${this.name} - Breaker: Half Open`);
        await this.halfOpen();
      }, (this.openStateDelay - timeInCurrentState)) as number;
    }
  }
  private async setOpenDelay(): Promise<void> {
    if (this.halfOpenStateMaxDelay) {
      const timeInCurrentState = Date.now() - this.stateTimestamp;
      if (timeInCurrentState >= this.halfOpenStateMaxDelay) {
        this.halfOpenMaxDelayTimeout = 0;
        await this.open();
      } else {
        this.halfOpenMaxDelayTimeout = <unknown>setTimeout(async () => {
          this.halfOpenMaxDelayTimeout = 0;
          await this.open();
        }, (this.halfOpenStateMaxDelay - timeInCurrentState)) as number;
      }
    }
  }
  private clearHalfOpenTimeout (): void {
    if (this.halfOpenMaxDelayTimeout) {
      clearTimeout(this.halfOpenMaxDelayTimeout);
      this.halfOpenMaxDelayTimeout = 0;
    }
  }

  public dispose (): void {
    super.dispose();
    this.clearHalfOpenTimeout();
    if (this.openTimeout) {
      clearTimeout(this.openTimeout);
      this.openTimeout = 0;
    }
  }
  public async getState(): Promise<SerializableRecord> {
    return new Promise((resolve) => {
      resolve({
        requests: this.requests,
        state: {
          state: this.state,
          timestamp: this.stateTimestamp
        }
      });
    });
  }
  public async setState(state: SerializableRecord[], ttl?: number): Promise<void> {
    return new Promise((resolve) => {
      resolve();
    });
  }
  public async clearState(): Promise<void> {
    return new Promise((resolve) => {
      this.requests = [];
      resolve();
    });
  }
}
