import { CircuitFunction } from '../../circuit.js';
import { SlidingWindowBreaker, SlidingWindowBreakerOptions, SlidingWindowRequestResult } from './index.js';

interface SlidingTimeElem {
  result: SlidingWindowRequestResult,
  timestamp: number
}

/**
 * The Sliding Time Breaker Module, that allows to break the circuit if it often fails on a time window.
 */
export class SlidingTimeBreaker extends SlidingWindowBreaker<SlidingTimeElem> {
  private maxSize: number;

  constructor(options?: SlidingWindowBreakerOptions) {
    super(options);
    this.slidingWindowSize = (options?.slidingWindowSize !== undefined) ? options.slidingWindowSize : 60;
    this.maxSize = 1000;
  }

  private filterCalls(): void {
    let nbCalls = this.callsInClosedState.length;
    if (nbCalls >= this.maxSize) {
      this.callsInClosedState.shift();
      nbCalls--;
    }
    let stillOk = true;
    const now = (new Date()).getTime();
    for (let i=0; i<nbCalls && stillOk;i++) {
      if ((now - this.callsInClosedState[0].timestamp) > this.slidingWindowSize) {
        this.callsInClosedState.shift();
      } else {
        stillOk = false;
      }
    }
  }

  public async executeInClosed<T> (promise: CircuitFunction, ...params: any[]): Promise<T> {
    const {requestResult, response, shouldReportFailure } = await this.executePromise(promise, ...params);
    this.filterCalls();
    const adjustedRequestResult = this.adjustRequestResult(requestResult, shouldReportFailure);
    this.callsInClosedState.push({
      result: adjustedRequestResult,
      timestamp: (new Date()).getTime()
    });
    if (this.callsInClosedState.length >= this.minimumNumberOfCalls && adjustedRequestResult !== SlidingWindowRequestResult.SUCCESS) {
      this.checkCallRatesClosed(this.open.bind(this));
    }
    if (requestResult === SlidingWindowRequestResult.FAILURE) {
      return Promise.reject(response);
    } else {
      return Promise.resolve(response);
    }
  }

  private checkCallRatesClosed(callbackFailure: (() => void)): void {
    const {nbSlow, nbFailure} = this.callsInClosedState.reduce(this.getNbSlowAndFailureTimeElem, {nbSlow: 0, nbFailure: 0});
    this.checkResult(nbSlow, nbFailure, this.callsInClosedState.length, callbackFailure);
  }

  public getNbSlowAndFailureTimeElem (acc: {nbSlow: number, nbFailure: number}, current: SlidingTimeElem): {nbSlow: number, nbFailure: number} {
    switch(current.result) {
      case SlidingWindowRequestResult.FAILURE:
        acc.nbFailure++;
        break;
      case SlidingWindowRequestResult.TIMEOUT:
        acc.nbSlow++;
    }
    return acc;
  }
}
