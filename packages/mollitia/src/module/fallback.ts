import { Module, ModuleOptions } from './index.js';
import { Circuit, CircuitFunction } from '../circuit.js';

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
  public async execute<T> (circuit: Circuit, promise: CircuitFunction, ...params: any[]): Promise<T> {
    const _exec = this._promiseFallback<T>(circuit, promise, ...params);
    const _params = this.getExecParams(circuit, params);
    this.emit('execute', circuit, _exec, _params);
    return _exec;
  }
  // Private Methods
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
