import { BreakerState } from '../index';
import { SlidingWindowBreaker, SlidingWindowBreakerOptions, SlidingWindowRequestResult } from './index';

export interface SlidingTimeElem {
  result: SlidingWindowRequestResult,
  timestamp: number
}

interface SlidingTimeBreakerOptions extends SlidingWindowBreakerOptions {
  slidingWindowSizeInMs?: boolean 
}

export class SlidingTimeBreaker extends SlidingWindowBreaker<SlidingTimeElem> {
  private maxSize: number;
  constructor(options?: SlidingTimeBreakerOptions) {
    super(options);
    if (options?.slidingWindowSizeInMs) {
      //Sliding window is in ms, no need to multiply by 1000
    } else {
      this.slidingWindowSize = this.slidingWindowSize * 1000;
    }
    this.maxSize = 1000;
  }
  
  private filterCalls(): void {
    let nbCalls = this.callsInClosedState.length;
    if (nbCalls >= this.maxSize) {
      this.callsInClosedState.shift;
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

  public async executeInClosed<T> (promise: any, ...params: any[]): Promise<T> {
    const {requestResult, response } = await this.executePromise(promise, ...params);
    //this.callsInClosedState = this.callsInClosedState.filter((elem) => (now - elem.timestamp) <= this.slidingWindowSize)
    this.filterCalls();
    this.callsInClosedState.push({result: requestResult, timestamp: (new Date()).getTime()});
    if (this.callsInClosedState.length >= this.minimumNumberOfCalls) {
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