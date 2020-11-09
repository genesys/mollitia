import { Module, ModuleOptions } from '.';
import { Circuit } from '../circuit';

type FallbackFunction = (...params: any[]) => any;

// TODO
interface FallbackOptions extends ModuleOptions {
  callback: FallbackFunction;
}

/**
 * TODO
 */
export class Fallback extends Module {
  // Public Attributes
  public callback: FallbackFunction;
  // Constructor
  constructor (options?: FallbackOptions) {
    super(options);
    this.callback = options?.callback || ((err) => err);
  }
  // Public Methods
  public async execute<T> (circuit: Circuit, promise: any, ...params: any[]): Promise<T> {
    const _exec = this._promiseFallback<T>(circuit, promise, ...params);
    this.emit('execute', circuit, _exec);
    return _exec;
  }
  // Private Methods
  private async _promiseFallback<T> (circuit: Circuit, promise: any, ...params: any[]): Promise<T> {
    return new Promise((resolve, reject) => {
      promise(...params)
        .then((res: any) => {
          resolve(res);
        })
        .catch((err: Error) => {
          reject(this.callback(err));
        });
    });
  }
}
