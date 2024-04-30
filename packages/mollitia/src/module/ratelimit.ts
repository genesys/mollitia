import { Module, ModuleOptions } from './index.js';
import { Circuit, CircuitFunction } from '../circuit.js';
import { SerializableRecord } from '../helpers/serializable.js';

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
  constructor(remainingTimeInRatelimit: number, name: string) {
    super('Ratelimited');
    this.name = name;
    this.remainingTimeInRatelimit = remainingTimeInRatelimit;
    Object.setPrototypeOf(this, RatelimitError.prototype);
  }
}
/**
 * The Ratelimit module can be used to avoid sending too many requests during a configurable period of time.
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
    this.limitPeriod = (options?.limitPeriod !== undefined) ? options.limitPeriod : 0;
    this.limitForPeriod = (options?.limitForPeriod !== undefined) ? options.limitForPeriod : Infinity;
    this.requestsTime = [];
  }
  public async getState(): Promise<SerializableRecord> {
    return new Promise((resolve) => {
      resolve({ requests: this.requestsTime });
    });
  }
  public async setState(state: SerializableRecord[], ttl?: number): Promise<void> {
    return new Promise((resolve) => {
      resolve();
    });
  }
  public async clearState(): Promise<void> {
    return new Promise((resolve) => {
      this.requestsTime = [];
      resolve();
    });
  }
  // Public Methods
  public async execute<T>(circuit: Circuit, promise: CircuitFunction, ...params: any[]): Promise<T> {
    let currentState;
    try {
      currentState = await this.getState();
    } catch (e) {
      this.logger?.warn(e);
    }
    if (currentState?.requests) {
      this.requestsTime = currentState?.requests as number[];
    }
    const _exec = this._promiseRatelimit<T>(circuit, promise, ...params);
    const _params = this.getExecParams(circuit, params);
    this.emit('execute', circuit, _exec, _params);
    return _exec;
  }

  private async addCurrentRequest(requestDate: number): Promise<void> {
    this.requestsTime.push(requestDate);
    try {
      await this.setState( [{ key: 'requests', value: this.requestsTime }], this.limitPeriod );
    } catch (e) {
      this.logger?.warn(e);
    }
  }
  // Private Methods
  private async _promiseRatelimit<T> (circuit: Circuit, promise: CircuitFunction, ...params: any[]): Promise<T> {
    if (!this.limitPeriod) {
      return promise(...params);
    }
    const now = (new Date()).getTime();
    if (this.requestsTime.length < this.limitForPeriod) {
      await this.addCurrentRequest(now);
      return promise(...params);
    } else {
      const deltaSinceFirstRequest = now - this.requestsTime[0];
      if (deltaSinceFirstRequest > this.limitPeriod) {
        this.requestsTime.splice(0, 1);
        await this.addCurrentRequest(now);
        return promise(...params);
      } else {
        this.logger?.debug(`${circuit.name}/${this.name} - Ratelimited`);
        this.emit('ratelimit', circuit);
        return Promise.reject(new RatelimitError(this.limitPeriod - deltaSinceFirstRequest, this.name));
      }
    }
  }
}
