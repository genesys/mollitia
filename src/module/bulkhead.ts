import { Module, ModuleOptions } from '.';
import { Circuit, CircuitFunction } from '../circuit';
import { EventEmitter } from '../helpers/event';

const MAX_TIMEOUT = 2147483647;

/**
 * Properties that customizes the bulkhead behavior.
 */
export abstract class BulkheadOptions extends ModuleOptions {
  /**
   * The number of concurrent requests that can be running in parallel.
   */
  concurrentSize?: number;
  /**
   * The number of requests that can be queued.
   */
  queueSize?: number;
  /**
   * The amount of time before a queued request is rejected.
   */
  maxQueueWait?: number;
}

/**
 * Returned when a bulkhead module concurrent buffer and queue are overloaded.
 * @param message Circuit is overloaded
 */
export class BulkheadOverloadError extends Error {
  constructor() {
    super('Circuit is overloaded');
    Object.setPrototypeOf(this, BulkheadOverloadError.prototype);
  }
}
/**
 * Returned when a bulkhead module request has been waiting for too long in queue.
 * @param message Waiting for too long in queue
 */
export class BulkheadQueueWaitError extends Error {
  constructor() {
    super('Waiting for too long in queue');
    Object.setPrototypeOf(this, BulkheadQueueWaitError.prototype);
  }
}

class BufferedPromise extends EventEmitter {
  private promise: CircuitFunction;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private params: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor (promise: CircuitFunction, ...params: any[]) {
    super();
    this.promise = promise;
    this.params = params;
  }
  public async execute<T> (): Promise<T> {
    return new Promise((resolve, reject) => {
      this.emit('execute');
      this.promise(...this.params)
        .then((res: T) => {
          this.emit('resolve', res);
          resolve(res);
        })
        .catch((err: Error) => {
          this.emit('reject', err);
          reject(err);
        });
    });
  }
}

/**
 * The Bulkhead Module, that allows to limit concurrent executions.
 */
export class Bulkhead extends Module {
  // Public Attributes
  /**
   * The number of concurrent requests that can be running in parallel.
   */
  public concurrentSize: number;
  /**
   * The number of requests that can be queued.
   */
  public queueSize: number;
  /**
   * The amount of time before a queued request is rejected.
   */
  public maxQueueWait: number;
  // Private Attributes
  public concurrentBuffer: BufferedPromise[];
  public queueBuffer: BufferedPromise[];
  // Constructor
  constructor (options?: BulkheadOptions) {
    super(options);
    this.concurrentSize = (options?.concurrentSize !== undefined) ? options.concurrentSize : 10;
    this.queueSize = (options?.queueSize !== undefined) ? options.queueSize : 10;
    this.maxQueueWait = (options?.maxQueueWait !== undefined) ? options.maxQueueWait : 60000;
    this.concurrentBuffer = [];
    this.queueBuffer = [];
  }
  // Public Methods
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async execute<T> (circuit: Circuit, promise: CircuitFunction, ...params: any[]): Promise<T> {
    const _exec = this._promiseBulkhead<T>(circuit, promise, ...params);
    this.emit('execute', circuit, _exec);
    return _exec;
  }
  // Private Methods
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async _promiseBulkhead<T> (circuit: Circuit, promise: CircuitFunction, ...params: any[]): Promise<T> {
    return new Promise((resolve, reject) => {
      const ref = new BufferedPromise(promise, ...params);
      if (this.concurrentBuffer.length < this.concurrentSize) {
        ref.execute<T>()
          .then((res) => {
            resolve(res);
          })
          .catch((err) => {
            reject(err);
          })
          .finally(() => {
            this.concurrentBuffer.splice(this.concurrentBuffer.indexOf(ref), 1);
            this._addBufferedPromise();
          });
        this.concurrentBuffer.push(ref);
      } else if (this.queueBuffer.length < this.queueSize) {
        this.queueBuffer.push(ref);
        let timeout: number;
        if (this.maxQueueWait <= MAX_TIMEOUT) {
          timeout = <unknown>setTimeout(() => {
            this.queueBuffer.splice(this.queueBuffer.indexOf(ref), 1);
            resolveDisposable.dispose();
            rejectDisposable.dispose();
            reject(new BulkheadQueueWaitError());
          }, this.maxQueueWait) as number;
        }
        const executeDisposable = ref.on('execute', () => {
          executeDisposable.dispose();
          clearTimeout(timeout);
        });
        const resolveDisposable = ref.on('resolve', (res) => {
          clearTimeout(timeout);
          this.concurrentBuffer.splice(this.concurrentBuffer.indexOf(ref), 1);
          resolveDisposable.dispose();
          rejectDisposable.dispose();
          this._addBufferedPromise();
          resolve(res);
        });
        const rejectDisposable = ref.on('reject', (err) => {
          clearTimeout(timeout);
          this.concurrentBuffer.splice(this.concurrentBuffer.indexOf(ref), 1);
          resolveDisposable.dispose();
          rejectDisposable.dispose();
          this._addBufferedPromise();
          reject(err);
        });
      } else {
        reject(new BulkheadOverloadError());
      }
    });
  }
  private _addBufferedPromise () {
    if (this.queueBuffer.length > 0) {
      const queueRef = this.queueBuffer.splice(0, 1)[0];
      queueRef.execute().catch(() => { return; });
      this.concurrentBuffer.push(queueRef);
    }
  }
}
