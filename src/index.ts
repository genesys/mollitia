import { circuits, Circuit, CircuitFactory, CircuitOptions, NoFuncError } from './circuit';
import { use, Plugin } from './plugin';
import { modules, Module, ModuleOptions } from './module/index';
import { Timeout, TimeoutError } from './module/timeout';
import { Retry } from './module/retry';
import { RateLimit, RateLimitError } from './module/rate-limit';
import { Fallback } from './module/fallback';
import { BreakerError, BreakerState } from './module/breaker';
import { ConsecutiveBreaker } from './module/breaker/consecutive-breaker';
import { SlidingCountBreaker } from './module/breaker/sliding/count-breaker'; 
import { SlidingTimeBreaker } from './module/breaker/sliding/time-breaker'; 

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
  BreakerState,
  RateLimit,
  RateLimitError,
  SlidingCountBreaker,
  SlidingTimeBreaker
};
