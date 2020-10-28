import { Module, ModuleOptions } from '.';
import { Circuit } from '../circuit';
import { EventEmitter } from '../helpers/event';

// TODO
interface BulkheadOptions extends ModuleOptions {
  concurrentSize?: number;
  queueSize?: number;
  maxQueueWait?: number;
}

export class BulkheadOverloadError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, BulkheadOverloadError.prototype);
  }
}

export class BulkheadQueueWaitError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, BulkheadQueueWaitError.prototype);
  }
}

class BufferedPromise extends EventEmitter {
  promise: any;
  params: any[];
  constructor (promise: any, ...params: any[]) {
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
 * TODO
 */
export class Bulkhead extends Module {
  // Public Attributes
  public concurrentSize: number;
  public queueSize: number;
  public maxQueueWait: number;
  // Private Attributes
  public concurrentBuffer: BufferedPromise[];
  public queueBuffer: BufferedPromise[];
  // Constructor
  constructor (options?: BulkheadOptions) {
    super(options);
    this.concurrentSize = options?.concurrentSize || 10;
    this.queueSize = options?.queueSize || 10;
    this.maxQueueWait = options?.maxQueueWait || 5000;
    this.concurrentBuffer = [];
    this.queueBuffer = [];
  }
  // Public Methods
  public async execute<T> (circuit: Circuit, promise: any, ...params: any[]): Promise<T> {
    this.emit('execute', circuit);
    return this._promiseBulkhead(circuit, promise, ...params);
  }
  // Private Methods
  private async _promiseBulkhead<T> (circuit: Circuit, promise: any, ...params: any[]): Promise<T> {
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
        const timeout = setTimeout(() => {
          this.queueBuffer.splice(this.queueBuffer.indexOf(ref), 1);
          resolveDisposable.dispose();
          rejectDisposable.dispose();
          reject(new BulkheadQueueWaitError('Waiting for too long in queue'))
        }, this.maxQueueWait);
        const executeDisposable = ref.on('execute', () => {
          executeDisposable.dispose();
          clearTimeout(timeout);
        });
        const resolveDisposable = ref.on('resolve', (res) => {
          clearTimeout(timeout);
          this.concurrentBuffer.splice(this.concurrentBuffer.indexOf(ref), 1);
          resolveDisposable.dispose();
          this._addBufferedPromise();
          resolve(res);
        });
        const rejectDisposable = ref.on('reject', (err) => {
          clearTimeout(timeout);
          this.concurrentBuffer.splice(this.concurrentBuffer.indexOf(ref), 1);
          rejectDisposable.dispose();
          this._addBufferedPromise();
          reject(err);
        });
      } else {
        reject(new BulkheadOverloadError('Circuit is overloaded'));
      }
    });
  }
  private _addBufferedPromise () {
    if (this.queueBuffer.length > 0) {
      const queueRef = this.queueBuffer.splice(0, 1)[0];
      this.concurrentBuffer.push(queueRef);
      queueRef.execute().catch(() => { return; });
    }
  }
}
