import { Circuit, CircuitOptions } from './circuit.js';
import { Module, ModuleOptions } from './module/index.js';

/**
 * Array containing every addons.
 */
export const addons: Addon[] = [];

/**
 * Adds a addon to Mollitia.
 * @param {Addon} addon Addon instance.
 */
export const use = (addon: Addon): void => {
  addons.push(addon);
};

/**
 * The Addon Interface, that should be implemented by any Mollitia addon.
 */
export abstract class Addon {
  onCircuitCreate? (circuit: Circuit, options?: CircuitOptions): void;
  onModuleCreate? (module: Module, options?: ModuleOptions): void;
}
