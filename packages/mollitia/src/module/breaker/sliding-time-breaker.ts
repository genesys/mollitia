import { CircuitFunction } from '../../circuit.js';
import { SlidingWindowBreaker, SlidingWindowBreakerOptions, SlidingWindowRequestResult } from './index.js';
import { SerializableRecord } from '../../helpers/serializable.js';

/**
 * The Sliding Time Breaker Module, that allows to break the circuit if it often fails on a time window.
 */
export class SlidingTimeBreaker extends SlidingWindowBreaker {
  private maxSize: number;

  constructor(options?: SlidingWindowBreakerOptions) {
    super(options);
    this.slidingWindowSize = (options?.slidingWindowSize !== undefined) ? options.slidingWindowSize : 60;
    this.maxSize = 1000;
  }

  private filterCalls(): void {
    let nbCalls = this.requests.length;
    if (nbCalls >= this.maxSize) {
      this.requests.splice(0, 1);
      nbCalls--;
    }
    let stillOk = true;
    const now = (new Date()).getTime();
    for (let i=0; i<nbCalls && stillOk;i++) {
      if ((now - this.requests[0].timestamp!) > this.slidingWindowSize) {
        this.requests.splice(0, 1);
      } else {
        stillOk = false;
      }
    }
  }

  public async executeInClosed<T> (promise: CircuitFunction, ...params: any[]): Promise<T> {
    const {requestResult, response, shouldReportFailure } = await this.executePromise(promise, ...params);
    this.filterCalls();
    const adjustedRequestResult = this.adjustRequestResult(requestResult, shouldReportFailure);
    this.requests.push({
      result: adjustedRequestResult,
      timestamp: (new Date()).getTime()
    });
    let stateSet = false;
    if (this.requests.length >= this.minimumNumberOfCalls && adjustedRequestResult !== SlidingWindowRequestResult.SUCCESS) {
        if (!this.checkCallRatesClosed()) {
          await this.open();
          stateSet = true;
        }
    }
    if (!stateSet) {
      await this.setStateSecure([ { key: 'requests', value: this.requests } ], this.slidingWindowSize);
    }
    if (requestResult === SlidingWindowRequestResult.FAILURE) {
      return Promise.reject(response);
    } else {
      return Promise.resolve(response);
    }
  }
}
