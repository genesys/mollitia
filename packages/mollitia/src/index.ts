// Version
export const version = __VERSION__;

// Addon
export { use, Addon } from './addon.js';

// Circuit
export {
  circuits,
  Circuit,
  CircuitFactory,
  type CircuitFunction,
  CircuitOptions,
  NoFuncError
} from './circuit.js';

// Module
export {
  modules,
  Module,
  ModuleOptions
} from './module/index.js';

// Timeout
export {
  Timeout,
  TimeoutOptions,
  TimeoutError
} from './module/timeout.js';

// Retry
export {
  Retry,
  RetryOptions,
  RetryMode
} from './module/retry.js';

// Fallback
export {
  Fallback,
  FallbackOptions
} from './module/fallback.js';

// Cache
export {
  Cache,
  CacheOptions
} from './module/cache.js';

// Bulkhead
export {
  Bulkhead,
  BulkheadOptions,
  BulkheadOverloadError,
  BulkheadQueueWaitError
} from './module/bulkhead.js';

// Ratelimit
export {
  Ratelimit,
  RatelimitError
} from './module/ratelimit.js';

// Breaker
export {
  BreakerError,
  BreakerMaxAllowedRequestError,
  BreakerState,
  SlidingWindowBreaker,
  SlidingWindowBreakerOptions,
  SlidingWindowRequestResult
} from './module/breaker/index.js';

// Sliding Count Breaker
export {
  SlidingCountBreaker
} from './module/breaker/sliding-count-breaker.js';

// Sliding Time Breaker
export {
  SlidingTimeBreaker
} from './module/breaker/sliding-time-breaker.js';

export {
  type Serializable,
  type SerializableRecord,
  type SerializablePrimitive,
  type SerializableArray
} from './helpers/serializable.js';
