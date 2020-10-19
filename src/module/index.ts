import { Circuit, Logger } from '../circuit';
import { EventEmitter } from '../helpers/event';
import { plugins } from '../plugin';

// TODO
export abstract class ModuleOptions {
  logger?: Logger;
}

// TODO
export const modules: Module[] = [];

// TODO do not extends EventEmttiter, let modules do
export class Module extends EventEmitter {
  // Public Attributes
  public logger?: Logger;
  // Constructor
  constructor (options?: ModuleOptions) {
    super();
    for (const plugin of plugins) {
      if (plugin.onModuleCreate) {
        plugin.onModuleCreate(this, options);
      }
    }
    this.logger = options?.logger;
    modules.push(this);
  }
  public execute<T> (circuit: Circuit, promise: any, ...params: any[]): Promise<T> {
    this.emit('execute', circuit);
    return promise(...params);
  }
}
