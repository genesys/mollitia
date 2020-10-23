import { SlidingWindowBreaker, SlidingWindowBreakerOptions, SlidingWindowRequestResult } from './index';

export class SlidingCountBreaker extends SlidingWindowBreaker<SlidingWindowRequestResult> {

  constructor(options?: SlidingWindowBreakerOptions) {
    super(options);
    this.slidingWindowSize = options?.slidingWindowSize || 10;
    if (this.slidingWindowSize < this.minimumNumberOfCalls) {
      this.slidingWindowSize = this.minimumNumberOfCalls;
    }
  }

  public async executeInClosed<T> (promise: any, ...params: any[]): Promise<T> {
    const {requestResult, response } = await this.executePromise(promise, ...params);
    this.callsInClosedState.push(requestResult);
    let nbCalls = this.callsInClosedState.length;
    if (nbCalls >= this.minimumNumberOfCalls) {
      while (nbCalls > this.slidingWindowSize) {
        this.callsInClosedState.shift();
        nbCalls--;
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