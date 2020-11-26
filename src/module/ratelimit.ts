import { Module, ModuleOptions } from '.';
import { Circuit, CircuitFunction } from '../circuit';

/**
 * Properties that customizes the ratelimit behavior.
 */
export abstract class RatelimitOptions extends ModuleOptions {
  /**
   * Specifies the time period during which the ratelimit is calculated
   */
  limitPeriod?: number;
  /**
   * Specifies the maximum number of requests during the period
   */
  limitForPeriod?: number;
}

/**
 * Returned when the ratelimit is reached.
 * @param message Ratelimited
 * @param remainingTimeInRatelimit Remaining time in ratelimit state
 */
export class RatelimitError extends Error {
  public remainingTimeInRatelimit: number;
  constructor(remainingTimeInRatelimit: number) {
    super('Ratelimited');
    this.remainingTimeInRatelimit = remainingTimeInRatelimit;
    Object.setPrototypeOf(this, RatelimitError.prototype);
  }
}
/**
 * TODO
 */
export class Ratelimit extends Module {
  // Public Attributes
  /**
   * Specifies the time period during which the ratelimit is calculated
   */
  public limitPeriod: number;
  /**
   * Specifies the maximum number of requests during the period
   */
  public limitForPeriod: number;
  // Private Attributes
  private requestsTime: number[];
  // Constructor
  constructor (options?: RatelimitOptions) {
    super(options);
    this.limitPeriod = options?.limitPeriod ? options?.limitPeriod : 0;
    this.limitForPeriod = options?.limitForPeriod ? options?.limitForPeriod : Infinity;
    this.requestsTime = [];
  }
  // Public Methods
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async execute<T> (circuit: Circuit, promise: CircuitFunction, ...params: any[]): Promise<T> {
    const _exec = this._promiseRatelimit<T>(circuit, promise, ...params);
    this.emit('execute', circuit, _exec);
    return _exec;
  }
  // Private Methods
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async _promiseRatelimit<T> (circuit: Circuit, promise: CircuitFunction, ...params: any[]): Promise<T> {
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
        this.logger?.debug(`${circuit.name}/${this.name} - Ratelimited`);
        this.emit('ratelimit', circuit);
        return Promise.reject(new RatelimitError(this.limitPeriod - deltaSinceFirstRequest));
      }
    }
  }
}
