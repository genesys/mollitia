import { Module, ModuleOptions } from '.';
import { Circuit, CircuitFunction } from '../circuit';
import { delay } from '../helpers/time';

type RetryCallback = (err: any) => boolean|number;

/**
 * Properties that customizes the retry behavior.
 */
export abstract class RetryOptions extends ModuleOptions {
  /**
   * The number of retry attempts (the function will be called attempts + 1 times).
   */
  attempts?: number;
  /**
   * The amount of time to wait before retrying.
   */
  interval?: number;
  /**
   * A filtering callback, to modify the retry behavior.
   * @returns true (retries), false (rejects), number (retries after some delay)
   */
  onRejection?: RetryCallback;
}

/**
 * The Retry Module, that allows to retry a function after it fails.
 */
export class Retry extends Module {
  // Public Attributes
  /**
   * The number of retry attempts (the function will be called attempts + 1 times).
   */
  public attempts: number;
  /**
   * The amount of time to wait before retrying.
   */
  public interval: number;
  /**
   * A filtering callback, to modify the retry behavior.
   * @returns true (retries), false (rejects), number (retries after some delay)
   */
  public onRejection: RetryCallback;
  // Constructor
  constructor (options?: RetryOptions) {
    super(options);
    this.attempts = options?.attempts ? options?.attempts : 2;
    this.interval = options?.interval ? options?.interval : 0;
    this.onRejection = options?.onRejection || (() => true);
  }
  // Public Methods
  public async execute<T> (circuit: Circuit, promise: CircuitFunction, ...params: any[]): Promise<T> {
    const _exec = this._promiseRetry<T>(circuit, this.attempts + 1, promise, ...params);
    this.emit('execute', circuit, _exec);
    return _exec;
  }
  // Private Methods
  private async _promiseRetry<T> (circuit: Circuit, attempts: number, promise: CircuitFunction, ...params: any[]): Promise<T> {
    if (attempts - 1 === 0) {
      this.emit('retry', circuit, this.attempts);
      this.logger?.debug(`${circuit.name}/${this.name} - Retry: (${this.attempts}/${this.attempts})`);
      return promise(...params);
    }
    if (attempts !== (this.attempts + 1)) {
      this.emit('retry', circuit, attempts - 1);
      this.logger?.debug(`${circuit.name}/${this.name} - Retry: (${attempts - 1}/${this.attempts})`);
    }
    return promise(...params).catch(async (err: any) => {
      const shouldRetry = this.onRejection(err);
      const interval = (typeof shouldRetry === 'number') ? shouldRetry : this.interval;
      if (shouldRetry === false) {
        return Promise.reject(err);
      } else {
        await delay(interval);
        return this._promiseRetry(circuit, (attempts - 1), promise, ...params);
      }
    });
  }
}
