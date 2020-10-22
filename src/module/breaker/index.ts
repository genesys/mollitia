import { Module, ModuleOptions } from '..';
import { Circuit } from '../../circuit';

// TODO
export interface BreakerOptions extends ModuleOptions {
  state?: BreakerState;
  openStateDelay?: number;
  halfOpenStateMaxDelay?: number;
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

export interface BreakerNotification {
  onOpened? (): void;
  onHalfOpened? (): void;
  onClosed? (): void;
}

export class Breaker extends Module implements BreakerNotification {
  // Public Attributes
  public state: BreakerState;
  public openStateDelay: number;
  public halfOpenStateMaxDelay: number;
  private halfOpenMaxDelayTimeout = 0;

  // Constructor
  constructor (options?: BreakerOptions) {
    super(options);
    this.state = options?.state || BreakerState.CLOSED;
    this.openStateDelay = options?.openStateDelay || 60 * 1000;
    this.halfOpenStateMaxDelay = options?.halfOpenStateMaxDelay || 0;
    if (this.state === BreakerState.OPENED) {
      this.setHalfDelay();
    } else if (this.state === BreakerState.HALF_OPENED) {
      this.setOpenDelay();
    }
  }

  public onOpened(): void {
    //Implementation on classes extending Breaker
  }

  public onClosed(): void {
    //Implementation on classes extending Breaker
  }

  public onHalfOpened(): void {
    //Implementation on classes extending Breaker
  }

  // Public Methods
  public async execute<T> (circuit: Circuit, promise: any, ...params: any[]): Promise<T> {
    this.emit('execute', circuit);
    return promise(promise, ...params);
  }
  public open (): void {
    if (this.state !== BreakerState.OPENED) {
      this.clearHalfOpenTimeout();
      this.state = BreakerState.OPENED;
      this.logger?.debug('Breaker: Open');
      this.setHalfDelay();
      this.onOpened();
      this.emit('stateChanged');
    }
  }
  public halfOpen (): void {
    if (this.state !== BreakerState.HALF_OPENED) {
      this.clearHalfOpenTimeout();
      this.state = BreakerState.HALF_OPENED;
      this.setOpenDelay();
      this.onHalfOpened();
      this.emit('stateChanged');
    }
  }
  public close (): void {
    if (this.state !== BreakerState.CLOSED) {
      this.clearHalfOpenTimeout();
      this.logger?.debug('Breaker: Close');
      this.state = BreakerState.CLOSED;
      this.onClosed();
      this.emit('stateChanged');
    }
  }
  private setHalfDelay (): void {
    setTimeout(() => {
      this.logger?.debug('Breaker: Half Open');
      this.halfOpen();
    }, this.openStateDelay);
  }
  private setOpenDelay (): void {
    if (this.halfOpenStateMaxDelay) {
      this.halfOpenMaxDelayTimeout = <unknown>setTimeout(() => {
        this.halfOpenMaxDelayTimeout = 0;
        this.open();
      }, this.halfOpenStateMaxDelay) as number;
    }
  }
  private clearHalfOpenTimeout (): void {
    if (this.halfOpenMaxDelayTimeout) {
      clearTimeout(this.halfOpenMaxDelayTimeout);
      this.halfOpenMaxDelayTimeout = 0;
    }
  }
}
