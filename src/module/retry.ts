import { Module, ModuleOptions } from '.';
import { Circuit } from '../circuit';

// TODO
interface RetryOptions extends ModuleOptions {
  attempts: number;
}

/**
 * TODO
 */
export class Retry extends Module {
  // Public Attributes
  public attempts: number;
  // Constructor
  constructor (options?: RetryOptions) {
    super(options);
    this.attempts = options?.attempts || 2;
  }
  // Public Methods
  public async execute<T> (circuit: Circuit, promise: any, ...params: any[]): Promise<T> {
    this.emit('execute', circuit);
    return this._promiseRetry(circuit, this.attempts + 1, promise, ...params);
  }
  // Private Methods
  private async _promiseRetry<T> (circuit: Circuit, attempts: number, promise: any, ...params: any[]): Promise<T> {
    if (attempts - 1 === 0) {
      this.logger?.debug(`Retry: (${this.attempts}/${this.attempts})`);
      return promise(...params);
    }
    if (attempts !== (this.attempts + 1)) {
      this.logger?.debug(`Retry: (${attempts - 1}/${this.attempts})`);
    }
    return promise(...params).catch(() => {
      return this._promiseRetry(circuit, (attempts - 1), promise, ...params);
    });
  }
}
