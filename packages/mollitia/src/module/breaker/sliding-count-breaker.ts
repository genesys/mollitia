import { CircuitFunction } from '../../circuit.js';
import { SlidingWindowBreaker, SlidingWindowBreakerOptions, SlidingWindowRequestResult } from './index.js';

/**
 * The Sliding Count Breaker Module, that allows to break the circuit if it fails too often.
 */
export class SlidingCountBreaker extends SlidingWindowBreaker {
  constructor(options?: SlidingWindowBreakerOptions) {
    super(options);
    this.slidingWindowSize = (options?.slidingWindowSize !== undefined) ? options.slidingWindowSize : 10;
    if (this.slidingWindowSize < this.minimumNumberOfCalls) {
      this.slidingWindowSize = this.minimumNumberOfCalls;
    }
  }

  public async executeInClosed<T>(promise: CircuitFunction, ...params: any[]): Promise<T> {
    const {requestResult, response, shouldReportFailure } = await this.executePromise(promise, ...params);
    const adjustedRequestResult = this.adjustRequestResult(requestResult, shouldReportFailure);
    this.requests.push({ result: adjustedRequestResult });
    const nbCalls = this.requests.length;
    let stateSet = false;
    if (nbCalls >= this.minimumNumberOfCalls) {
      if (nbCalls > this.slidingWindowSize) {
        this.requests.splice(0, nbCalls - this.slidingWindowSize);
        stateSet = true;
        await this.setStateSecure([ { key: 'requests', value: this.requests } ]);
      }
      if (adjustedRequestResult !== SlidingWindowRequestResult.SUCCESS) {
        if (!this.checkCallRatesClosed()) {
          await this.open();
          stateSet = true;
        }
      }
    }
    if (!stateSet) {
      await this.setStateSecure([{ key: 'requests', value: this.requests } ]);
    }
    if (requestResult === SlidingWindowRequestResult.FAILURE) {
      return Promise.reject(response);
    } else {
      return Promise.resolve(response);
    }
  }
}
