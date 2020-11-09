import { Module, ModuleOptions } from '.';
import { Circuit } from '../circuit';
import { delay } from '../helpers/time';

type RetryCallback = (err: any) => boolean|number;

// TODO
interface RetryOptions extends ModuleOptions {
  attempts?: number;
  interval?: number;
  onRejection?: RetryCallback;
}

// TODO add filter function to filter errors, choose to retry, and change the interval

/**
 * TODO
 */
export class Retry extends Module {
  // Public Attributes
  public attempts: number;
  public interval: number;
  public onRejection: RetryCallback;
  // Constructor
  constructor (options?: RetryOptions) {
    super(options);
    this.attempts = options?.attempts || 2;
    this.interval = options?.interval || 0;
    this.onRejection = options?.onRejection || (() => true);
  }
  // Public Methods
  public async execute<T> (circuit: Circuit, promise: any, ...params: any[]): Promise<T> {
    const _exec = this._promiseRetry<T>(circuit, this.attempts + 1, promise, ...params);
    this.emit('execute', circuit, _exec);
    return _exec;
  }
  // Private Methods
  private async _promiseRetry<T> (circuit: Circuit, attempts: number, promise: any, ...params: any[]): Promise<T> {
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
