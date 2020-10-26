import { Module, ModuleOptions } from '.';
import { Circuit } from '../circuit';

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

class BufferedPromise {
  promise: any;
  params: any[];
  constructor (promise: any, ...params: any[]) {
    this.promise = promise;
    this.params = params;
  }
  public async execute<T> (): Promise<T> {
    return this.promise(...this.params);
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
  private concurrentBuffer: BufferedPromise[];
  private queueBuffer: BufferedPromise[];
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
            // TODO remove from buffer
            // TODO eventually add from queue
            console.info('SNETCH: finally');
          });
        this.concurrentBuffer.push(ref);
        // TODO push normal
      } else if (this.queueBuffer.length < this.queueSize) {
        this.queueBuffer.push(ref);
      } else {
        reject(new BulkheadOverloadError('Circuit is overloaded'));
      }
    });
  }
}
