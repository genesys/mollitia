import * as Mollitia from 'mollitia';
import * as PrometheusCircuit from './circuit.js';
import * as PrometheusTimeout from './module/timeout.js';
import * as PrometheusRetry from './module/retry.js';
import * as PrometheusBulkhead from './module/bulkhead.js';
import * as PrometheusCache from './module/cache.js';
import * as PrometheusRatelimit from './module/ratelimit.js';
import * as PrometheusFallback from './module/fallback.js';
import * as PrometheusBreaker from './module/breaker/index.js';
import * as PrometheusModule from './module/index.js';

export const version = __VERSION__;

export type CircuitFunction = (...params: any[]) => Promise<any>;

// Declaration Overriding
declare module 'mollitia' {
  // Circuit
  interface CircuitOptions {
    /**
     * Prometheus specific Circuit options. [Prometheus Addon]
     */
    prometheus?: PrometheusCircuit.PrometheusCircuitOptions;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Circuit {
    /**
     * Prometheus Circuit helper. [Prometheus Addon]
     */
    prometheus: PrometheusCircuit.PrometheusCircuitData;
    /**
     * Modifies the Circuit function.
     * @param func The Circuit function.
     * @param funcName The Method name. (snake_case). [Prometheus Addon]
     */
    fn (func: CircuitFunction, funcName?: string): Circuit;
  }
  // Module
  interface Module {
    /**
     * Prometheus Module helper. [Prometheus Addon]
     */
    prometheus: PrometheusModule.PrometheusModuleData;
  }
  interface ModuleOptions {
    /**
     * Prometheus specific Module options. [Prometheus Addon]
     */
    prometheus?: PrometheusModule.PrometheusModuleOptions;
  }
  interface Timeout {
    /**
     * Prometheus Timeout helper. [Prometheus Addon]
     */
    prometheus: PrometheusTimeout.PrometheusTimeoutData;
  }
  interface Retry {
    /**
     * Prometheus Retry helper. [Prometheus Addon]
     */
    prometheus: PrometheusRetry.PrometheusRetryData;
  }
  interface Cache {
    /**
     * Prometheus Cache helper. [Prometheus Addon]
     */
    prometheus: PrometheusCache.PrometheusCacheData;
  }
  interface Bulkhead {
    /**
     * Prometheus Bulkhead helper. [Prometheus Addon]
     */
    prometheus: PrometheusBulkhead.PrometheusBulkheadData;
  }
  interface Fallback {
    /**
     * Prometheus Fallback helper. [Prometheus Addon]
     */
    prometheus: PrometheusFallback.PrometheusFallbackData;
  }
  interface Ratelimit {
    /**
     * Prometheus Ratelimit helper. [Prometheus Addon]
     */
    prometheus: PrometheusRatelimit.PrometheusRatelimitData;
  }
  interface SlidingTimeBreaker {
    /**
     * Prometheus Sliding Time Breaker helper. [Prometheus Addon]
     */
    prometheus: PrometheusBreaker.PrometheusBreakerData;
  }
  interface SlidingCountBreaker {
    /**
     * Prometheus Sliding Count Breaker helper. [Prometheus Addon]
     */
    prometheus: PrometheusBreaker.PrometheusBreakerData;
  }
}

interface GlobalMetrics {
  [key: string]: number;
}

interface ModuleMetrics {
  [key: string]: GlobalMetrics;
}

interface ValueMetrics {
  [key: string]: {
    /**
     * Object containing all Circuit metrics. [Prometheus Addon]
     * @example
     * const metrics = MollitiaPrometheus.metrics();
     * console.info(metrics.total_executions.circuits.MyCircuit);
     * // Returns the number of time MyCircuit has been executed.
     */
    circuits: GlobalMetrics;
    /**
     * Object containing all Module metrics. [Prometheus Addon]
     * @example
     * const metrics = MollitiaPrometheus.metrics();
     * console.info(metrics.total_executions.modules.MyModule.MyCircuit);
     * // Returns the number of time the MyModule has been executed in MyCircuit.
     */
    modules: ModuleMetrics;
  }
}

interface ScrapMetrics {
  [key: string]: {
    help: string;
    value: string;
  }
}

/**
 * Array containing every circuit.
 */
export const circuits: Mollitia.Circuit[] = [];
/**
 * Array containing every modules.
 */
export const modules: Mollitia.Module[] = [];

/**
 * Returns the full Mollitia metrics (Circuits and Modules) [Prometheus Addon]
 * @example
 * const metrics = MollitiaPrometheus.metrics();
 * console.info(metrics.total_executions.circuits.MyCircuit);
 * // Returns the number of time MyCircuit has been executed.
 */
export const metrics = (): ValueMetrics => {
  const _metrics: ValueMetrics = {};
  for (const circuit of circuits) {
    const circuitName = circuit.prometheus.name;
    for (const metric in circuit.prometheus.metrics) {
      if (_metrics[metric]) {
        _metrics[metric].circuits[circuitName] = circuit.prometheus.metrics[metric].values[circuitName];
      } else {
        _metrics[metric] = {
          circuits: {
            [circuitName]: circuit.prometheus.metrics[metric].values[circuitName] || 0
          },
          modules: {}
        };
      }
    }
  }
  for (const module of modules) {
    const moduleName = module.prometheus.name;
    for (const metric in module.prometheus.metrics) {
      if (Object.keys(module.prometheus.metrics[metric].values).length) {
        if (_metrics[metric]) {
          _metrics[metric].modules[moduleName] = module.prometheus.metrics[metric].values;
        } else {
          _metrics[metric] = {
            circuits: {},
            modules: {
              [moduleName]: module.prometheus.metrics[metric].values
            }
          };
        }
      }
    }
  }
  return _metrics;
};

/**
 * Returns the full Prometheus scrap (Circuits and Modules) [Prometheus Addon]
 */
export const scrap = (): string => {
  const _metrics: ScrapMetrics = {};
  for (const circuit of circuits) {
    for (const metric in circuit.prometheus.metrics) {
      if (_metrics[metric]) {
        _metrics[metric].value += circuit.prometheus.metrics[metric].scrapValues();
      } else {
        _metrics[metric] = {
          help: circuit.prometheus.metrics[metric].scrapHelp(),
          value: circuit.prometheus.metrics[metric].scrapValues()
        };
      }
    }
  }
  for (const module of modules) {
    for (const metric in module.prometheus.metrics) {
      if (_metrics[metric]) {
        _metrics[metric].value += module.prometheus.metrics[metric].scrapValues();
      } else {
        _metrics[metric] = {
          help: module.prometheus.metrics[metric].scrapHelp(),
          value: module.prometheus.metrics[metric].scrapValues()
        };
      }
    }
  }
  let str = '';
  for (const metric in _metrics) {
    str += `${_metrics[metric].help}${_metrics[metric].value}\n`;
  }
  return str;
};

/**
 * The PrometheusAddon Class, that should be added to the core Mollitia module. [Prometheus Addon]
 * @example
 * Mollitia.use(new MollitiaPrometheus.PrometheusAddon());
 */
export class PrometheusAddon implements Mollitia.Addon {
  // Lifecycle
  onCircuitCreate (circuit: Mollitia.Circuit, options: Mollitia.CircuitOptions): void {
    if (options.prometheus) {
      circuit.prometheus = {
        name: options.prometheus.name,
        perMethod: options.prometheus.perMethod ? options.prometheus.perMethod : false,
        labels: options.prometheus.labels || {},
        metrics: PrometheusCircuit.attachMetrics(circuit, options),
        scrap: () => {
          let scrap = '';
          for (const metric in circuit.prometheus.metrics) {
            scrap += circuit.prometheus.metrics[metric].scrap();
          }
          return scrap;
        }
      };
      const _fn = circuit.fn.bind(circuit);
      circuit.fn = (promise: any, funcName?: string): Mollitia.Circuit => {
        circuit.prometheus.funcName = funcName || promise.name;
        return _fn(promise, funcName);
      };
      circuits.push(circuit);
    }
  }
  onModuleCreate (module: Mollitia.Module, options: Mollitia.ModuleOptions): void {
    if (options.prometheus) {
      let attachMetrics;
      switch (module.constructor.name) {
        case Mollitia.Timeout.name: {
          attachMetrics = PrometheusTimeout.attachMetrics;
          break;
        }
        case Mollitia.Retry.name: {
          attachMetrics = PrometheusRetry.attachMetrics;
          break;
        }
        case Mollitia.Bulkhead.name: {
          attachMetrics = PrometheusBulkhead.attachMetrics;
          break;
        }
        case Mollitia.Cache.name: {
          attachMetrics = PrometheusCache.attachMetrics;
          break;
        }
        case Mollitia.Ratelimit.name: {
          attachMetrics = PrometheusRatelimit.attachMetrics;
          break;
        }
        case Mollitia.Fallback.name: {
          attachMetrics = PrometheusFallback.attachMetrics;
          break;
        }
        case Mollitia.SlidingWindowBreakerOptions.name:
        case Mollitia.SlidingCountBreaker.name:
        case Mollitia.SlidingTimeBreaker.name: {
          attachMetrics = PrometheusBreaker.attachMetrics;
          break;
        }
        default: {
          attachMetrics = () => { return {}; };
        }
      }
      module.prometheus = {
        name: options.prometheus.name,
        labels: options.prometheus.labels || {},
        metrics: attachMetrics(module, options),
        scrap: () => {
          let scrap = '';
          for (const metric in module.prometheus.metrics) {
            scrap += module.prometheus.metrics[metric].scrap();
          }
          return scrap;
        }
      };
      modules.push(module);
    }
  }
}
