import { Breaker, BreakerError, BreakerOptions, BreakerState } from './index';
import { Circuit } from '../../circuit';

// TODO
interface ConsecutiveBreakerOptions extends BreakerOptions {
  count?: number;
}

/**
 * TODO
 */
export class ConsecutiveBreaker extends Breaker {
  // Public Attributes
  public failures: number;
  public count: number;
  // Constructor
  constructor (options?: ConsecutiveBreakerOptions) {
    super(options);
    this.failures = 0;
    this.count = options?.count || 2;
  }
  // Public Methods
  public async execute<T> (circuit: Circuit, promise: any, ...params: any[]): Promise<T> {
    this.emit('execute', circuit);
    return this._promiseBreaker(circuit, promise, ...params);
  }
  // Private Methods
  private async _promiseBreaker<T> (circuit: Circuit, promise: any, ...params: any[]): Promise<T> {
    return new Promise((resolve, reject) => {
      if (this.state !== BreakerState.OPENED) {
        promise(...params)
          .then((res: any) => {
            this.failures = 0;
            if (this.state === BreakerState.HALF_OPENED) {
              this.close();
            }
            resolve(res);
          })
          .catch((err: Error) => {
            if (this.state === BreakerState.HALF_OPENED) {
              this.open();
            } else {
              this.failures++;
              this.logger?.debug(`ConsecutiveBreaker: (${this.failures}/${this.count})`);
              if (this.failures === this.count) {
                this.open();
              }
            }
            reject(err);
          });
      } else {
        reject(new BreakerError('Circuit is opened'));
      }
    });
  }
}
