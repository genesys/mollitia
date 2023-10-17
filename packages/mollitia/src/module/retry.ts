import { Module, ModuleOptions } from './index.js';
import { Circuit, CircuitFunction } from '../circuit.js';
import { delay } from '../helpers/time.js';

type RetryCallback = (err: any, attempt: number) => boolean|number;

export enum RetryMode {
  CONSTANT = 'constant',
  LINEAR = 'linear',
  EXPONENTIAL = 'exponential',
  JITTER = 'jitter'
}

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
   * The mode for the retry (constant, linear, exponential or jitter)
   */
  mode?: RetryMode;
  /**
   * The factor to be applied for the retry mode
   */
  factor?: number;
  /**
   * The maximum amount of time to wait before retrying another time
   */
  maxInterval?: number;
  /**
   * Should the first retry be done directly after a failure occurred
   */
  fastFirst?: boolean;
  /**
   * The value (between 0 and 1) to adjust delay randomly based on jitter retry duration
   */
  jitterAdjustment?: number;
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
   * The mode for the retry (constant, linear, exponential or jitter)
   */
  public mode: RetryMode;
  /**
   * The factor to be applied for the retry mode
   */
  public factor: number;
  /**
   * The maximum amount of time to wait before retrying another time
   */
  public maxInterval: number;
  /**
   * Should the first retry be done directly after a failure occurred
   */
  public fastFirst: boolean;
  /**
   * The value to adjust delay randomly based on jitter retry duration
   */
  private _jitterAdjustment: number;
  /**
   * A filtering callback, to modify the retry behavior.
   * @returns true (retries), false (rejects), number (retries after some delay)
   */
  public onRejection: RetryCallback;

  /**
   * The value (between 0 and 1) to adjust delay randomly based on jitter retry duration
  */
  public get jitterAdjustment(): number {
    return this._jitterAdjustment;
  }
  /**
   * Set the value (between 0 and 1) for jitter adjustment (to adjust delay randomly).
  */
  public set jitterAdjustment(val: number) {
    this._jitterAdjustment = this.adjustJitterValue(val);
  }

  private adjustJitterValue(val: number): number {
    return Math.min(1, Math.max(0, val));
  }

  // Constructor
  constructor (options?: RetryOptions) {
    super(options);
    this.attempts = options?.attempts ?? 2;
    this.interval = options?.interval ?? 0;
    this.fastFirst = options?.fastFirst ?? false;
    this.maxInterval = options?.maxInterval ?? Infinity;
    this.mode = options?.mode ?? RetryMode.CONSTANT;
    this._jitterAdjustment = this.adjustJitterValue(options?.jitterAdjustment ?? 0.1);
    const factorDefaultValue = this.mode === 'linear' ? 1 : 2;
    this.factor = options?.factor ?? factorDefaultValue;
    this.onRejection = options?.onRejection || (() => true);
  }
  // Public Methods
  public async execute<T> (circuit: Circuit, promise: CircuitFunction, ...params: any[]): Promise<T> {
    const _exec = this._promiseRetry<T>(circuit, this.attempts + 1, promise, ...params);
    const _params = this.getExecParams(circuit, params);
    this.emit('execute', circuit, _exec, _params);
    return _exec;
  }
  // Private Methods
  private async waitBeforeNextTry (nbRetry: number, circuit: Circuit): Promise<void> {
    let waitDuration = 0;
    if (this.fastFirst) {
      if (nbRetry === 0) {
        this.emit('delay-before-next-retry', circuit, 0);
        return Promise.resolve();
      } else {
        nbRetry--;
      }
    }
    switch (this.mode) {
      case RetryMode.LINEAR: {
        waitDuration = Math.min(this.interval + (this.interval * this.factor * nbRetry), this.maxInterval);
        break;
      }
      case RetryMode.EXPONENTIAL: {
        waitDuration = Math.min(this.interval * (this.factor ** nbRetry), this.maxInterval);
        break;
      }
      case RetryMode.JITTER: {
        const jitterValue = Math.min(this.interval * (this.factor ** nbRetry), this.maxInterval);
        const jitterMinValue = jitterValue * (1 - this.jitterAdjustment);
        const jitterMaxValue = Math.min(jitterValue * (1 + this.jitterAdjustment), this.maxInterval);
        const jitterDelta = jitterMaxValue - jitterMinValue;
        waitDuration = Math.floor(Math.random() * jitterDelta) + jitterMinValue;
        break;
      }
      case RetryMode.CONSTANT:
      default: {
        waitDuration = Math.min(this.interval, this.maxInterval);
        break;
      }
    }
    this.emit('delay-before-next-retry', circuit, waitDuration);
    return delay(waitDuration);
  }
  private async _promiseRetry<T> (circuit: Circuit, attempts: number, promise: CircuitFunction, ...params: any[]): Promise<T> {
    if (attempts - 1 === 0) {
      if (this.attempts) {
        this.emit('retry', circuit, this.attempts);
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
        if (shouldRetry === false) {
          if (attempts !== (this.attempts + 1)) {
            this.emit('failure-with-retry', circuit, this.attempts - attempts + 1);
          } else {
            this.emit('failure-without-retry', circuit);
          }
          return Promise.reject(err);
        } else {
          if (typeof shouldRetry === 'number') {
            this.emit('delay-before-next-retry', circuit, shouldRetry);
            await delay(shouldRetry);
          } else {
            await this.waitBeforeNextTry(this.attempts - attempts + 1, circuit);
          }
          return this._promiseRetry(circuit, (attempts - 1), promise, ...params);
        }
      });
  }
}
