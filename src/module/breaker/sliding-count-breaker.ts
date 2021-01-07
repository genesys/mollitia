import { CircuitFunction } from '../../circuit';
import { SlidingWindowBreaker, SlidingWindowBreakerOptions, SlidingWindowRequestResult } from './index';

/**
 * The Sliding Count Breaker Module, that allows to break the circuit if it fails too often.
 */
export class SlidingCountBreaker extends SlidingWindowBreaker<SlidingWindowRequestResult> {
  constructor(options?: SlidingWindowBreakerOptions) {
    super(options);
    this.slidingWindowSize = (options?.slidingWindowSize !== undefined) ? options.slidingWindowSize : 10;
    if (this.slidingWindowSize < this.minimumNumberOfCalls) {
      this.slidingWindowSize = this.minimumNumberOfCalls;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async executeInClosed<T> (promise: CircuitFunction, ...params: any[]): Promise<T> {
    const {requestResult, response, shouldReportFailure } = await this.executePromise(promise, ...params);
    this.callsInClosedState.push(this.adjustedRequestResult(requestResult, shouldReportFailure));
    const nbCalls = this.callsInClosedState.length;
    if (nbCalls >= this.minimumNumberOfCalls) {
      if (nbCalls > this.slidingWindowSize) {
        this.callsInClosedState.splice(0,(nbCalls - this.slidingWindowSize));
      }
      this.checkCallRatesClosed(this.open.bind(this));
    }
    if (requestResult === SlidingWindowRequestResult.FAILURE) {
      return Promise.reject(response);
    } else {
      return Promise.resolve(response);
    }
  }

  private checkCallRatesClosed(callbackFailure: (() => void)): void {
    const {nbSlow, nbFailure} = this.callsInClosedState.reduce(this.getNbSlowAndFailure, {nbSlow: 0, nbFailure: 0});
    this.checkResult(nbSlow, nbFailure, this.callsInClosedState.length, callbackFailure);
  }
}
