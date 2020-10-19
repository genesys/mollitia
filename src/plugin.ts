import { Circuit, CircuitOptions } from './circuit';
import { Module, ModuleOptions } from './module/index';

export const plugins: Plugin[] = [];

export const use = (plugin: Plugin): void => {
  plugins.push(plugin);
};

export interface Plugin {
  onCircuitCreate? (circuit: Circuit, options?: CircuitOptions): void;
  onModuleCreate? (module: Module, options?: ModuleOptions): void;
}
