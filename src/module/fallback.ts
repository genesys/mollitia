import { Module, ModuleOptions } from '.';
import { Circuit, CircuitFunction } from '../circuit';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FallbackFunction = (...params: any[]) => any;

/**
 * Properties that customizes the fallback behavior.
 */
export abstract class FallbackOptions extends ModuleOptions {
  /**
   * The callback, called when the circuit rejects, can be used to reject another error.
   */
  callback: FallbackFunction = ((err: Error) => err);
}

/**
 * The Fallback Module, that allows to filter errors.
 */
export class Fallback extends Module {
  // Public Attributes
  /**
   * The callback, called when the circuit rejects, can be used to reject another error.
   */
  public callback: FallbackFunction;
  // Constructor
  constructor (options?: FallbackOptions) {
    super(options);
    this.callback = options?.callback || ((err: Error) => err);
  }
  // Public Methods
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async execute<T> (circuit: Circuit, promise: CircuitFunction, ...params: any[]): Promise<T> {
    const _exec = this._promiseFallback<T>(circuit, promise, ...params);
    this.emit('execute', circuit, _exec);
    return _exec;
  }
  // Private Methods
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async _promiseFallback<T> (circuit: Circuit, promise: CircuitFunction, ...params: any[]): Promise<T> {
    return new Promise((resolve, reject) => {
      promise(...params)
        .then((res: T) => {
          resolve(res);
        })
        .catch((err: Error) => {
          reject(this.callback(err));
        });
    });
  }
}
