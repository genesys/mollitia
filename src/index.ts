import { circuits, Circuit, CircuitFactory, CircuitOptions, NoFuncError } from './circuit';
import { use, Plugin } from './plugin';
import { modules, Module, ModuleOptions } from './module/index';
import { Timeout, TimeoutError } from './module/timeout';
import { Retry } from './module/retry';
import { RateLimit, RateLimitError } from './module/rate-limit';
import { Fallback } from './module/fallback';
import { BreakerError } from './module/breaker';
import { ConsecutiveBreaker } from './module/breaker/consecutive-breaker';

// Default Export
export {
  // Circuit
  circuits,
  Circuit,
  CircuitFactory,
  CircuitOptions,
  // Module
  modules,
  Module,
  ModuleOptions,
  Timeout,
  Retry,
  ConsecutiveBreaker,
  Fallback,
  // Plugin
  use,
  Plugin,
  // Error
  NoFuncError,
  TimeoutError,
  BreakerError,
  RateLimit,
  RateLimitError
};
