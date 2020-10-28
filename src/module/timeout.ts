import { Module, ModuleOptions } from '.';
import { Circuit } from '../circuit';

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

// TODO
interface TimeoutOptions extends ModuleOptions {
  delay?: number;
}

/**
 * TODO
 */
export class Timeout extends Module {
  // Public Attributes
  public delay: number;
  // Constructor
  constructor (options?: TimeoutOptions) {
    super(options);
    this.delay = options?.delay || 10000;
  }
  // Public Methods
  public async execute<T> (circuit: Circuit, promise: any, ...params: any[]): Promise<T> {
    this.emit('execute', circuit);
    return this._promiseTimeout(circuit, this.delay, promise, ...params);
  }
  // Private Methods
  private async _promiseTimeout<T> (circuit: Circuit, time: number, promise: any, ...params: any[]): Promise<T> {
    let timeout: number;
    if (time !== 0 && time !== Infinity) {
      return Promise.race([
        promise(...params),
        new Promise<T>((resolve, reject) => {
          timeout = <unknown>setTimeout(() => {
            this.emitTimeout(circuit);
            reject(new TimeoutError('Timed out'));
          }, time) as number;
        })
      ])
      .then((result) => {
        clearTimeout(timeout);
        return result;
      })
      .catch((result) => {
        clearTimeout(timeout);
        return Promise.reject(result);
      })
    } else {
      return promise(...params);
    }
  }
  private emitTimeout (circuit: Circuit) {
    this.logger?.debug('Has timed out');
    this.emit('timeout', circuit);
  }
}