import { Module, ModuleOptions } from '..';
import { Circuit } from '../../circuit';

// TODO
export interface BreakerOptions extends ModuleOptions {
  state?: BreakerState;
  resetDelay?: number;
}

export class BreakerError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, BreakerError.prototype);
  }
}

export enum BreakerState {
  CLOSED = 'closed',
  HALF_OPENED = 'half-opened',
  OPENED = 'opened'
}

export class Breaker extends Module {
  // Public Attributes
  public state: BreakerState;
  public resetDelay: number;
  // Constructor
  constructor (options?: BreakerOptions) {
    super(options);
    this.state = options?.state || BreakerState.CLOSED;
    this.resetDelay = options?.resetDelay || 60 * 1000;
  }
  // Public Methods
  public async execute<T> (circuit: Circuit, promise: any, ...params: any[]): Promise<T> {
    this.emit('execute', circuit);
    return promise(promise, ...params);
  }
  public open (): void {
    this.state = BreakerState.OPENED;
    this.logger?.debug('Breaker: Open');
    this.setHalfDelay();
  }
  public halfOpen (): void {
    this.state = BreakerState.HALF_OPENED;
  }
  public close (): void {
    this.state = BreakerState.CLOSED;
  }
  public setHalfDelay (): void {
    setTimeout(() => {
      this.state = BreakerState.HALF_OPENED;
      this.logger?.debug('Breaker: Half Open');
    }, this.resetDelay);
  }
}
