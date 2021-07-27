import { Module, ModuleOptions } from '..';
import { Circuit, CircuitFunction } from '../../circuit';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ErrorCallback = (err: any) => boolean;

type BreakerResultResponse = {
  requestResult: SlidingWindowRequestResult;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export abstract class SlidingWindowBreaker<T> extends Module {
  // Public Attributes
  /**
   * Specifies the circuit state
   */
  public state: BreakerState;
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
  protected callsInClosedState: T[];
  private halfOpenMaxDelayTimeout = 0;
  private openTimeout = 0;
  private nbCallsInHalfOpenedState: number;
  private callsInHalfOpenedState: SlidingWindowRequestResult[];

  constructor (options?: SlidingWindowBreakerOptions) {
    super(options);
    this.state = (options?.state !== undefined) ? options.state : BreakerState.CLOSED;
    this.openStateDelay = (options?.openStateDelay !== undefined) ? options.openStateDelay : 60 * 1000;
    this.halfOpenStateMaxDelay = (options?.halfOpenStateMaxDelay !== undefined) ? options.halfOpenStateMaxDelay : 0;
    if (this.state === BreakerState.OPENED) {
      this.setHalfDelay();
    } else if (this.state === BreakerState.HALF_OPENED) {
      this.setOpenDelay();
    }
    this.slidingWindowSize = (options?.slidingWindowSize !== undefined) ? options.slidingWindowSize : 10;
    this.minimumNumberOfCalls = (options?.minimumNumberOfCalls !== undefined) ? options.minimumNumberOfCalls : 10;
    this.failureRateThreshold = (options?.failureRateThreshold !== undefined) ? options.failureRateThreshold : 50;
    this.slowCallDurationThreshold = (options?.slowCallDurationThreshold !== undefined) ? options.slowCallDurationThreshold : 60000;
    this.slowCallRateThreshold = (options?.slowCallRateThreshold !== undefined) ? options?.slowCallRateThreshold : 100;
    this.permittedNumberOfCallsInHalfOpenState =
      (options?.permittedNumberOfCallsInHalfOpenState !== undefined) ? options.permittedNumberOfCallsInHalfOpenState : 2;
    this.nbCallsInHalfOpenedState = 0;
    this.callsInHalfOpenedState = [];
    this.callsInClosedState = [];
    this.onError = options?.onError || (() => true);
  }

  private reinitializeCounters (): void {
    this.nbCallsInHalfOpenedState = 0;
    this.callsInClosedState = [];
    this.callsInHalfOpenedState = [];
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async execute<T1> (circuit: Circuit, promise: CircuitFunction, ...params: any[]): Promise<T1> {
    const _exec = this._promiseBreaker<T1>(circuit, promise, ...params);
    this.emit('execute', circuit, _exec);
    return _exec;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async _promiseBreaker<T1> (circuit: Circuit, promise: CircuitFunction, ...params: any[]): Promise<T1> {
    switch (this.state) {
      case BreakerState.OPENED:
        this.logger?.debug(`${circuit.name}/${this.name} - Circuit is opened`);
        return Promise.reject(new BreakerError());
      case BreakerState.HALF_OPENED:
        return this.executeInHalfOpened(promise, ...params);
      case BreakerState.CLOSED:
        default:
        return this.executeInClosed(promise, ...params);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract executeInClosed<T1> (promise: CircuitFunction, ...params: any[]): Promise<T1>;

  protected adjustedRequestResult(requestResult: SlidingWindowRequestResult, shouldReportFailure: boolean): SlidingWindowRequestResult {
    if (!shouldReportFailure && requestResult === SlidingWindowRequestResult.FAILURE) {
      return SlidingWindowRequestResult.SUCCESS;
    }
    return requestResult;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected async executeInHalfOpened<T1> (promise: CircuitFunction, ...params: any[]): Promise<T1> {
    if (this.nbCallsInHalfOpenedState < this.permittedNumberOfCallsInHalfOpenState) {
      this.nbCallsInHalfOpenedState++;
      const {requestResult, response, shouldReportFailure } = await this.executePromise(promise, ...params);
      this.callsInHalfOpenedState.push(this.adjustedRequestResult(requestResult, shouldReportFailure));

      if (this.callsInHalfOpenedState.length == this.permittedNumberOfCallsInHalfOpenState) {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const {nbSlow, nbFailure} = this.callsInHalfOpenedState.reduce(this.getNbSlowAndFailure, {nbSlow: 0, nbFailure: 0});
    this.checkResult(nbSlow, nbFailure, this.callsInHalfOpenedState.length, callbackFailure, callbackSuccess);
  }

  protected checkResult(nbSlow: number, nbFailure: number, nbCalls: number, callbackFailure: (() => void), callbackSuccess?: (() => void)): void {
    if (
      (this.slowCallRateThreshold < 100 && (((nbSlow / nbCalls) * 100) >= this.slowCallRateThreshold)) ||
      (this.failureRateThreshold < 100 && (((nbFailure / nbCalls) * 100) >= this.failureRateThreshold))
    ) {
      callbackFailure();
    } else {
      if (callbackSuccess) {
        callbackSuccess();
      }
    }
  }

  protected getNbSlowAndFailure(acc: {nbSlow: number, nbFailure: number}, current: SlidingWindowRequestResult): {nbSlow: number, nbFailure: number} {
    switch(current) {
      case SlidingWindowRequestResult.FAILURE:
        acc.nbFailure++;
        break;
      case SlidingWindowRequestResult.TIMEOUT:
        acc.nbSlow++;
    }
    return acc;
  }

  protected _open (circuit: Circuit): void {
    if (this.state !== BreakerState.OPENED) {
      this.logger?.debug(`${circuit.name}/${this.name} - Breaker: Open`);
      this.open();
    }
  }
  protected _close (circuit: Circuit): void {
    if (this.state !== BreakerState.CLOSED) {
      this.logger?.debug(`${circuit.name}/${this.name} - Breaker: Close`);
      this.close();
    }
  }

  public open (): void {
    if (this.state !== BreakerState.OPENED) {
      this.clearHalfOpenTimeout();
      this.state = BreakerState.OPENED;
      this.setHalfDelay();
      this.onOpened();
      this.emit('state-changed', this.state);
    }
  }
  public halfOpen (): void {
    if (this.state !== BreakerState.HALF_OPENED) {
      this.clearHalfOpenTimeout();
      this.state = BreakerState.HALF_OPENED;
      this.setOpenDelay();
      this.onHalfOpened();
      this.emit('state-changed', this.state);
    }
  }
  public close (): void {
    if (this.state !== BreakerState.CLOSED) {
      this.clearHalfOpenTimeout();
      this.state = BreakerState.CLOSED;
      this.onClosed();
      this.emit('state-changed', this.state);
    }
  }
  private setHalfDelay (): void {
    this.openTimeout = <unknown>setTimeout(() => {
      this.logger?.debug(`${this.name} - Breaker: Half Open`);
      this.halfOpen();
    }, this.openStateDelay) as number;
  }
  private setOpenDelay (): void {
    if (this.halfOpenStateMaxDelay) {
      this.halfOpenMaxDelayTimeout = <unknown>setTimeout(() => {
        this.halfOpenMaxDelayTimeout = 0;
        this.open();
      }, this.halfOpenStateMaxDelay) as number;
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
}
