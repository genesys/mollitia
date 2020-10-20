import { Module, ModuleOptions } from '.';
import { Circuit } from '../circuit';

interface RateLimitOptions extends ModuleOptions {
  limitPeriod : number;
  limitForPeriod: number;
}

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}
/**
 * TODO
 */
export class RateLimit extends Module {
  // Public Attributes
  public limitPeriod: number;
  public limitForPeriod: number;
  private requestsTime: number[];
  // Constructor
  constructor (options?: RateLimitOptions) {
    super(options);
    this.limitPeriod = options?.limitPeriod || 0;
    this.limitForPeriod = options?.limitForPeriod || Infinity;
    this.requestsTime = [];
  }
  // Public Methods
  public async execute<T> (circuit: Circuit, promise: any, ...params: any[]): Promise<T> {
    this.emit('execute', circuit);
    if (!this.limitPeriod) {
      return promise(...params);
    }

    const now = (new Date()).getTime();
    if (this.requestsTime.length < this.limitForPeriod) {
      this.requestsTime.push(now);
      return promise(...params);
    } else {
      if (now - this.requestsTime[0] > this.limitPeriod) {
        this.requestsTime.splice(0,1);
        this.requestsTime.push(now);
        return promise(...params);
      } else {
        return Promise.reject(new RateLimitError('Rate Limited'));
      }
    }
  }
}
