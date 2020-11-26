import { EventEmitter } from './helpers/event';
import { Module } from './module';
import { addons } from './addon';

/**
 * Returned when a circuit has no function defined.
 * @param message Circuit has no function set
 */
export class NoFuncError extends Error {
  constructor () {
    super('Circuit has no function set');
    Object.setPrototypeOf(this, NoFuncError.prototype);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CircuitFunction = (...params: any[]) => Promise<any>;

export interface Logger {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug(message?: any, ...optionalParams: any[]): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info(message?: any, ...optionalParams: any[]): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn(message?: any, ...optionalParams: any[]): void;
}

/**
 * Properties that customizes the circuit behavior.
 */
export abstract class CircuitOptions {
  /**
   * Module list, by order of execution.
   */
  modules?: Module[];
}

/**
 * Properties that defines the circuit.
 */
export abstract class CircuitFactory {
  /**
   * The Circuit name.
   */
  name?: string;
  /**
   * The Circuit function.
   */
  func?: CircuitFunction;
  /**
   * The Circuit options.
   */
  options?: CircuitOptions;
}

const undefinedFunc = async () => {
  return new Promise((resolve, reject) => {
    reject(new NoFuncError());
  });
};

/**
 * Array containing every circuit.
 */
export const circuits: Circuit[] = [];

/**
 * The Circuit Class, that may contain Modules to add resilience patterns.
 */
export class Circuit extends EventEmitter {
  // Public Attributes
  /**
   * The Circuit name.
   */
  public name: string;
  /**
   * The Circuit function.
   */
  public func: CircuitFunction;
  /**
   * Module list, by order of execution.
   */
  public modules: Module[];
  // Constructor
  constructor (factory?: CircuitFactory) {
    super();
    this.name = factory?.name ? factory.name : `Circuit${circuits.length}`;
    for (const addon of addons) {
      if (addon.onCircuitCreate) {
        addon.onCircuitCreate(this, factory?.options);
      }
    }
    this.func = factory?.func ? factory.func : undefinedFunc;
    this.modules = factory?.options?.modules || [];
    circuits.push(this);
  }
  // Public Methods
  /**
   * Modifies the Circuit function.
   * @param {CircuitFunction} func The Circuit function.
   */
  public fn (func: CircuitFunction): Circuit {
    this.func = func;
    return this;
  }
  /**
   * Executes the Circuit function.
   * @param params Eventual parameters to pass to the Circuit function.
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
  /**
   * Disposes the Circuit, to cleanup every interval and timeouts.
   */
  public dispose (): void {
    super.dispose();
    if (this.modules) {
      this.modules.forEach(mod => mod.dispose());
    }
  }
}
