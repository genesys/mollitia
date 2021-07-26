import { Module, ModuleOptions } from '.';
import { Circuit, CircuitFunction } from '../circuit';
import { delay } from '../helpers/time';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RetryCallback = (err: any, attempt: number) => boolean|number;

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
    this.attempts = (options?.attempts !== undefined) ? options.attempts : 2;
    this.interval = (options?.interval !== undefined) ? options.interval : 0;
    this.onRejection = options?.onRejection || (() => true);
  }
  // Public Methods
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async execute<T> (circuit: Circuit, promise: CircuitFunction, ...params: any[]): Promise<T> {
    const _exec = this._promiseRetry<T>(circuit, this.attempts + 1, promise, ...params);
    this.emit('execute', circuit, _exec);
    return _exec;
  }
  // Private Methods
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async _promiseRetry<T> (circuit: Circuit, attempts: number, promise: CircuitFunction, ...params: any[]): Promise<T> {
    if (attempts - 1 === 0) {
      this.emit('retry', circuit, this.attempts);
      if (this.attempts) {
        this.logger?.debug(`${circuit.name}/${this.name} - Retry: (${this.attempts}/${this.attempts})`);
      }
      return promise(...params)
        .then((res) => {
          if (this.attempts > 0) {
            this.emit('success-with-retry', circuit, this.attempts);
          } else {
            this.emit('success-without-retry', circuit);
          }
          return res;
        })
        .catch((err) => {
          if (this.attempts > 0) {
            this.emit('failure-with-retry', circuit, this.attempts);
          } else {
            this.emit('failure-without-retry', circuit);
          }
          throw err;
        });
    }
    if (attempts !== (this.attempts + 1)) {
      this.emit('retry', circuit, this.attempts - attempts + 1);
      this.logger?.debug(`${circuit.name}/${this.name} - Retry: (${this.attempts - attempts + 1}/${this.attempts})`);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return promise(...params)
      .then((res) => {
        if (attempts !== (this.attempts + 1)) {
          this.emit('success-with-retry', circuit, this.attempts - attempts + 1);
        } else {
          this.emit('success-without-retry', circuit);
        }
        return res;
      })
      .catch(async (err) => {
        const shouldRetry = this.onRejection(err, this.attempts - attempts + 1);
        const interval = (typeof shouldRetry === 'number') ? shouldRetry : this.interval;
        if (shouldRetry === false) {
          if (attempts !== (this.attempts + 1)) {
            this.emit('failure-with-retry', circuit, this.attempts - attempts + 1);
          } else {
            this.emit('failure-without-retry', circuit);
          }
          return Promise.reject(err);
        } else {
          await delay(interval);
          return this._promiseRetry(circuit, (attempts - 1), promise, ...params);
        }
      });
  }
}
