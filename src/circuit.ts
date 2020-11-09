import { EventEmitter } from './helpers/event';
import { Module } from './module';
import { plugins } from './plugin';

export class NoFuncError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, NoFuncError.prototype);
  }
}

// TODO
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CircuitFunction = (...params: any[]) => Promise<any>;

export interface Logger {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug(message?: any, ...optionalParams: any[]): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info(message?: any, ...optionalParams: any[]): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn(message?: any, ...optionalParams: any[]): void;
}

// TODO
export abstract class CircuitOptions {
  modules?: Module[];
}

// TODO
export abstract class CircuitFactory {
  name?: string;
  func?: CircuitFunction;
  options?: CircuitOptions;
}

// TODO
const undefinedFunc = async () => {
  return new Promise((resolve, reject) => {
    reject(new NoFuncError('Circuit has no function set'));
  });
};

// TODO
export const circuits: Circuit[] = [];

/**
 * TODO
 */
export class Circuit extends EventEmitter {
  // Public Attributes
  public name: string;
  public func: CircuitFunction;
  public modules: Module[];
  // Private Attributes
  // Constructor
  constructor (factory?: CircuitFactory) {
    super();
    this.name = factory?.name ? factory.name : `Circuit${circuits.length}`;
    for (const plugin of plugins) {
      if (plugin.onCircuitCreate) {
        plugin.onCircuitCreate(this, factory?.options);
      }
    }
    this.func = factory?.func ? factory.func : undefinedFunc;
    this.modules = factory?.options?.modules || [];
    circuits.push(this);
  }
  // Public Methods
  /**
   * TODO
   */
  public fn (func: CircuitFunction): Circuit {
    this.func = func;
    return this;
  }
  /**
   * TODO
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async execute<T> (...params: any[]): Promise<T> {
    let _exec;
    if (this.modules.length) {
      if (this.modules.length > 1) {
        const args = [];
        for (let i = 2; i < this.modules.length; i++) {
          args.push(this, this.modules[i].execute.bind(this.modules[i]));
        }
        args.push(this, this.func, ...params);
        _exec = this.modules[0].execute(this, this.modules[1].execute.bind(this.modules[1]), ...args);
      } else {
        _exec = this.modules[0].execute(this, this.func, ...params);
      }
    } else {
      _exec = this.func(...params);
    }
    this.emit('execute', this, _exec);
    return _exec;
  }
  public dispose (): void {
    super.dispose();
    if (this.modules) {
      this.modules.forEach(mod => mod.dispose());
    }
  }
}
