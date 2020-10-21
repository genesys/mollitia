import { SlidingWindowBreaker, SlidingWindowRequestResult } from './index';

export class SlidingCountBreaker extends SlidingWindowBreaker<SlidingWindowRequestResult> {

  public async executeInClosed<T> (promise: any, ...params: any[]): Promise<T> {
    const {requestResult, response } = await this.executePromise(promise, ...params);
    this.callsInClosedState.push(requestResult);
    const nbCalls = this.callsInClosedState.length;
    if (nbCalls >= this.minimumNumberOfCalls) {
      if (nbCalls > this.slidingWindowSize) {
        this.callsInClosedState.shift();
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