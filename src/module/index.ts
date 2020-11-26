import { Circuit, CircuitFunction, Logger } from '../circuit';
import { EventEmitter } from '../helpers/event';
import { addons } from '../addon';

/**
 * Properties that customizes the module behavior.
 */
export abstract class ModuleOptions {
  name?: string;
  logger?: Logger;
}

/**
 * Array containing every module.
 */
export const modules: Module[] = [];

/**
 * The Module Class, that may modifies the circuit behavior.
 */
export class Module extends EventEmitter {
  // Public Attributes
  /**
   * The Module name.
   */
  public name: string;
  /**
   * The Module logger, for monitoring.
   */
  public logger?: Logger;
  // Constructor
  constructor (options?: ModuleOptions) {
    super();
    this.name = options?.name ? options.name : `Module${modules.length}`;
    for (const addon of addons) {
      if (addon.onModuleCreate) {
        addon.onModuleCreate(this, options);
      }
    }
    this.logger = options?.logger;
    modules.push(this);
  }
  /**
   * Called when the module is executed by the circuit.
   * @param circuit The Circuit reference.
   * @param promise The Circuit function.
   * @param params The Eventual parameters to use with the Circuit function.
   * @example
   * // Empty code to execute the function and emit the execute event
   * const _exec = promise(...params);
   * this.emit('execute', circuit, _exec);
   * return _exec;
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public execute<T> (circuit: Circuit, promise: CircuitFunction, ...params: any[]): Promise<T> {
    const _exec = promise(...params);
    this.emit('execute', circuit, _exec);
    return _exec;
  }
}
