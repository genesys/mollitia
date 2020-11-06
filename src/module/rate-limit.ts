import { Module, ModuleOptions } from '.';
import { Circuit } from '../circuit';

interface RateLimitOptions extends ModuleOptions {
  limitPeriod : number;
  limitForPeriod: number;
}

export class RateLimitError extends Error {
  public remainingTimeInRateLimit: number;

  constructor(message: string, remainingTimeInRateLimit: number) {
    super(message);
    this.remainingTimeInRateLimit = remainingTimeInRateLimit;
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
      const deltaSinceFirstRequest = now - this.requestsTime[0];
      if (deltaSinceFirstRequest > this.limitPeriod) {
        this.requestsTime.shift();
        this.requestsTime.push(now);
        return promise(...params);
      } else {
        this.logger?.debug(`${circuit.name}/${this.name} - Rate Limited`);
        this.emit('rateLimit', circuit);
        return Promise.reject(new RateLimitError('Rate Limited', (this.limitPeriod - deltaSinceFirstRequest)));
      }
    }
  }
}
