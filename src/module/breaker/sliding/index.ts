import { Breaker, BreakerOptions, BreakerState, BreakerError } from '../index';
import { Circuit } from '../../../circuit';

export interface SlidingWindowBreakerOptions extends BreakerOptions {
  slidingWindowSize?:                     number;
  minimumNumberOfCalls?:                  number;
  failureRateThreshold?:                  number;
  slowCallRateThreshold?:                 number;
  slowCallDurationThreshold?:             number;
  permittedNumberOfCallsInHalfOpenState?:  number;
}

export enum SlidingWindowRequestResult {
  SUCCESS =  0,
  FAILURE =  1,
  TIMEOUT =  2
}

export abstract class SlidingWindowBreaker<T> extends Breaker {
  public slidingWindowSize: number;
  public minimumNumberOfCalls: number;
  public failureRateThreshold: number;
  public slowCallRateThreshold: number;
  public slowCallDurationThreshold: number;
  public permittedNumberOfCallsInHalfOpenState: number;
  public callsInClosedState: T[];
  private nbCallsInHalfOpenedState: number;
  private callsInHalfOpenedState: SlidingWindowRequestResult[];

  constructor (options?: SlidingWindowBreakerOptions) {
    super(options);
    this.slidingWindowSize                    = options?.slidingWindowSize || 10;
    this.minimumNumberOfCalls                 = options?.minimumNumberOfCalls || 10;
    this.failureRateThreshold                 = (options?.failureRateThreshold || 50);
    this.slowCallDurationThreshold            = options?.slowCallDurationThreshold || 60000;
    this.slowCallRateThreshold                = (options?.slowCallRateThreshold || 100);
    this.permittedNumberOfCallsInHalfOpenState = options?.permittedNumberOfCallsInHalfOpenState || 2;
    this.nbCallsInHalfOpenedState = 0;
    this.callsInHalfOpenedState = [];
    this.callsInClosedState = [];
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
    this.emit('execute', circuit);
    switch (this.state) {
      case BreakerState.OPENED:
        this.logger?.debug('Circuit is opened');
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
        return {requestResult: SlidingWindowRequestResult.FAILURE, response: err};
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
}