import { Module, ModuleOptions } from '..';
import { Circuit } from '../../circuit';

type ErrorCallback = (err: any) => boolean;

export class BreakerError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, BreakerError.prototype);
  }
}

export enum BreakerState {
  CLOSED = 'closed',
  HALF_OPENED = 'half-opened',
  OPENED = 'opened'
}

export interface BreakerNotification {
  onOpened? (): void;
  onHalfOpened? (): void;
  onClosed? (): void;
}

export interface SlidingWindowBreakerOptions extends ModuleOptions {
  state?:                                  BreakerState;
  openStateDelay?:                         number;
  halfOpenStateMaxDelay?:                  number;
  slidingWindowSize?:                      number;
  minimumNumberOfCalls?:                   number;
  failureRateThreshold?:                   number;
  slowCallRateThreshold?:                  number;
  slowCallDurationThreshold?:              number;
  permittedNumberOfCallsInHalfOpenState?:  number;
  onError?:                                ErrorCallback;
}

export enum SlidingWindowRequestResult {
  SUCCESS =  0,
  FAILURE =  1,
  TIMEOUT =  2
}

export abstract class SlidingWindowBreaker<T> extends Module implements BreakerNotification {
  public state: BreakerState;
  public openStateDelay: number;
  public halfOpenStateMaxDelay: number;
  public slidingWindowSize: number;
  public minimumNumberOfCalls: number;
  public failureRateThreshold: number;
  public slowCallRateThreshold: number;
  public slowCallDurationThreshold: number;
  public permittedNumberOfCallsInHalfOpenState: number;
  public callsInClosedState: T[];
  private halfOpenMaxDelayTimeout = 0;
  private openTimeout = 0;
  private nbCallsInHalfOpenedState: number;
  private callsInHalfOpenedState: SlidingWindowRequestResult[];
  public onError: ErrorCallback;

  constructor (options?: SlidingWindowBreakerOptions) {
    super(options);
    this.state = options?.state || BreakerState.CLOSED;
    this.openStateDelay = options?.openStateDelay || 60 * 1000;
    this.halfOpenStateMaxDelay = options?.halfOpenStateMaxDelay || 0;
    if (this.state === BreakerState.OPENED) {
      this.setHalfDelay();
    } else if (this.state === BreakerState.HALF_OPENED) {
      this.setOpenDelay();
    }
    this.slidingWindowSize                    = options?.slidingWindowSize ? options?.slidingWindowSize : 10;
    this.minimumNumberOfCalls                 = options?.minimumNumberOfCalls ? options?.minimumNumberOfCalls : 10;
    this.failureRateThreshold                 = (options?.failureRateThreshold ? options?.failureRateThreshold : 50);
    this.slowCallDurationThreshold            = options?.slowCallDurationThreshold ? options?.slowCallDurationThreshold : 60000;
    this.slowCallRateThreshold                = (options?.slowCallRateThreshold ? options?.slowCallRateThreshold : 100);
    this.permittedNumberOfCallsInHalfOpenState = options?.permittedNumberOfCallsInHalfOpenState ? options?.permittedNumberOfCallsInHalfOpenState : 2;
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

  public async execute<T1> (circuit: Circuit, promise: any, ...params: any[]): Promise<T1> {
    const _exec = this._promiseBreaker<T1>(circuit, promise, ...params);
    this.emit('execute', circuit, _exec);
    return _exec;
  }
  private async _promiseBreaker<T> (circuit: Circuit, promise: any, ...params: any[]): Promise<T> {
    switch (this.state) {
      case BreakerState.OPENED:
        this.logger?.debug(`${circuit.name}/${this.name} - Circuit is opened`);
        return Promise.reject(new BreakerError('Circuit is opened'));
      case BreakerState.HALF_OPENED:
        return await this.executeInHalfOpened(promise, ...params);
      case BreakerState.CLOSED:
        return await this.executeInClosed(promise, ...params);
    }
  } 

  abstract executeInClosed<T1> (promise: any, ...params: any[]): Promise<T1>;

  protected async executeInHalfOpened<T1> (promise: any, ...params: any[]): Promise<T1> {
    if (this.nbCallsInHalfOpenedState < this.permittedNumberOfCallsInHalfOpenState) {
      this.nbCallsInHalfOpenedState++;
      const {requestResult, response } = await this.executePromise(promise, ...params);
      this.callsInHalfOpenedState.push(requestResult);
      if (this.callsInHalfOpenedState.length == this.permittedNumberOfCallsInHalfOpenState) {
        this.checkCallRatesHalfOpen(this.open.bind(this), this.close.bind(this));
      }
      if (requestResult === SlidingWindowRequestResult.FAILURE) {
        return Promise.reject(response);
      } else {
        return Promise.resolve(response);
      }
    } else {
      return Promise.reject(new BreakerError('Circuit is half opened and max allowed request in this state has been reached'));
    }
  }

  protected executePromise(promise: any, ...params: any[]): Promise<{requestResult: SlidingWindowRequestResult, response: any}> {
    const beforeRequest = (new Date()).getTime();
    return promise(...params)
      .then((res: any) => {
        const afterRequest = (new Date()).getTime();
        let requestResp = SlidingWindowRequestResult.SUCCESS;
        if (this.slowCallDurationThreshold !== 0 && this.slowCallDurationThreshold !== Infinity) {
          if ((afterRequest - beforeRequest) > this.slowCallDurationThreshold) {
            requestResp = SlidingWindowRequestResult.TIMEOUT;
          }
        }
        return {requestResult: requestResp, response: res};
      })
      .catch((err: any) => {
        const shouldReportFailure = this.onError(err);
        const returnedValue = shouldReportFailure ? SlidingWindowRequestResult.FAILURE : SlidingWindowRequestResult.SUCCESS;
        return {requestResult: returnedValue, response: err};
      });
  }

  protected checkCallRatesHalfOpen(callbackFailure: (() => void), callbackSuccess?: (() => void)): void {
    const {nbSlow, nbFailure} = this.callsInHalfOpenedState.reduce(this.getNbSlowAndFailure, {nbSlow: 0, nbFailure: 0});
    this.checkResult(nbSlow, nbFailure, this.callsInHalfOpenedState.length, callbackFailure, callbackSuccess);
  }

  protected checkResult(nbSlow: number, nbFailure: number, nbCalls: number, callbackFailure: (() => void), callbackSuccess?: (() => void)): void {
    if (
      (this.slowCallRateThreshold < 100 && (((nbSlow / nbCalls) * 100) >= this.slowCallRateThreshold)) ||
      (this.failureRateThreshold < 100 && (((nbFailure / nbCalls) * 100)>= this.failureRateThreshold))
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
      this.emit('stateChanged');
    }
  }
  public halfOpen (): void {
    if (this.state !== BreakerState.HALF_OPENED) {
      this.clearHalfOpenTimeout();
      this.state = BreakerState.HALF_OPENED;
      this.setOpenDelay();
      this.onHalfOpened();
      this.emit('stateChanged');
    }
  }
  public close (): void {
    if (this.state !== BreakerState.CLOSED) {
      this.clearHalfOpenTimeout();
      this.state = BreakerState.CLOSED;
      this.onClosed();
      this.emit('stateChanged');
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
