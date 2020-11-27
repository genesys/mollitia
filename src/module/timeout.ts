import { Module, ModuleOptions } from '.';
import { Circuit, CircuitFunction } from '../circuit';

/**
 * Properties that customizes the timeout behavior.
 */
export abstract class TimeoutOptions extends ModuleOptions {
  /**
   * The amount of time before a promise is rejected.
   */
  delay?: number;
}

/**
 * Returned when a function times out.
 * @param message Timed out
 */
export class TimeoutError extends Error {
  constructor() {
    super('Timed out');
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * The Timeout Module, that allows to ignore the result of the function if it takes too long.
 */
export class Timeout extends Module {
  // Public Attributes
  /**
   * The amount of time before a promise is rejected.
   */
  public delay: number;
  // Constructor
  constructor (options?: TimeoutOptions) {
    super(options);
    this.delay = options?.delay ? options?.delay : 60000;
  }
  // Public Methods
  public async execute<T> (circuit: Circuit, promise: CircuitFunction, ...params: any[]): Promise<T> {
    const _exec = this._promiseTimeout<T>(circuit, this.delay, promise, ...params);
    this.emit('execute', circuit, _exec);
    return _exec;
  }
  // Private Methods
  private async _promiseTimeout<T> (circuit: Circuit, time: number, promise: CircuitFunction, ...params: any[]): Promise<T> {
    let timeout: number;
    if (time !== 0 && time !== Infinity) {
      return Promise.race([
        promise(...params),
        new Promise<T>((resolve, reject) => {
          timeout = <unknown>setTimeout(() => {
            this.emitTimeout(circuit);
            reject(new TimeoutError());
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
    this.logger?.debug(`${circuit.name}/${this.name} - Has timed out`);
    this.emit('timeout', circuit);
  }
}