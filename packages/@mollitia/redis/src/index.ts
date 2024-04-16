import * as Mollitia from 'mollitia';
import { RedisStorage } from './redis.js';

export const version = __VERSION__;

// Declaration Overriding
declare module 'mollitia' {
  interface ModuleOptions {
    /**
     * Redis Circuit helper. [Redis Addon]
     */
    redis?: {
      /**
       * Specifies if redis is used for the module.
      */
      use: boolean;
      /**
       * Max Delay to wait before timing out requests to get value for a Redis Key within this module.
      */
      getMaxDelay?: number;
      /**
       * Global Max Delay to wait before timing out requests to set value for a Redis Key within this module.
      */
      setMaxDelay?: number;
      /**
       * Time to Live for Redis keys within this module.
      */
      ttl?: number;
    }
  }
}
/**
 * Array containing every modules.
 */
export const modules: Mollitia.Module[] = [];

//TODO: Add Redis Cluster connection capability
export interface RedisAddonOptions {
  /**
   * The Logger for Redis Addon
   */
  logger?: Mollitia.Logger,
  /**
   * Redis Url (Connect using either Redis URL or Redis Host + Redis Port).
  */
  url?: string,
  /**
   * Redis Host.
  */
  host?: string,
  /**
   * Redis Port.
  */
  port?: number,
  /**
   * Username to connect to Redis
  */
  username?: string,
  /**
   * Password to connect to Redis
  */
  password?: string,
  /**
   * Global TTL (Time To Live) for Redis keys. This could be overridden per module.
  */
  ttl?: number,
  /**
   * Global Max Delay to wait before timing out requests to get value for a Redis Key. This could be overridden per module.
  */
  getMaxDelay?: number,
  /**
   * Global Max Delay to wait before timing out requests to set value for a Redis Key. This could be overridden per module.
  */
  setMaxDelay?: number
}

/**
 * The RedisAddon Class, that should be added to the core Mollitia module. [Redis Addon]
 * @example
 * Mollitia.use(new MollitiaRedis.RedisAddon());
 */
export class RedisAddon implements Mollitia.Addon {
  private redis?: RedisStorage;
  private getMaxDelay = 500;
  private setMaxDelay = 500;
  private ttl = 0;
  private logger?: Mollitia.Logger;

  constructor(options: RedisAddonOptions) {
    this.logger = options.logger;
    if (!options.url && (!options.host || !options.port)) {
      this.logger?.warn('Redis configuration is invalid');
      return;
    }
    this.redis = new RedisStorage(options);
    this.getMaxDelay = options.getMaxDelay || 500; //0 for getMaxDelay is not a valid value
    this.setMaxDelay = options.setMaxDelay ?? 500;
    this.ttl = options.ttl || 0;
  }

  private async getStateWithRedis (moduleName: string, getMaxDelay: number): Promise<Mollitia.SerializableRecord> {
    return new Promise((resolve, reject) => {
      const opTimeout = setTimeout(() => {
        reject('Getting the state from Redis timed out.');
      }, getMaxDelay);
      try {
        this.redis!.getState(moduleName).then((data) => {
          clearTimeout(opTimeout);
          resolve(data);
        });
      }
      catch (e) {
        clearTimeout(opTimeout);
        reject('Error occurred while trying to get the state from Redis.');
      }
    });
  }

  private async setStateWithRedis(moduleName: string, state: Mollitia.SerializableRecord[], setMaxDelay: number, ttl: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const opTimeout = setTimeout(() => {
        reject('Setting the state in Redis timed out.');
      }, setMaxDelay);
      try {
        this.redis!.setState(moduleName, state, ttl).then(() => {
          clearTimeout(opTimeout);
          resolve();
        });
      } catch (e) {
        clearTimeout(opTimeout);
        reject('Error occurred while trying to set the state in Redis');
      }
    });
  }

  private moduleOverride(mod: Mollitia.Ratelimit | Mollitia.SlidingWindowBreaker, getMaxDelay: number, setMaxDelay: number, moduleTtl: number): void {
    mod.getState = async (): Promise<Mollitia.SerializableRecord> => {
      return this.getStateWithRedis(mod.name, getMaxDelay);
    };
    mod.setState = async (state: Mollitia.SerializableRecord[], ttl = 0): Promise<void> => {
      return this.setStateWithRedis(mod.name, state, setMaxDelay, ttl || moduleTtl);
    }
    mod.clearState = async (): Promise<void> => {
      return this.redis!.clearState(mod.name);
    }
  }
  onModuleCreate (module: Mollitia.Module, options: Mollitia.ModuleOptions): void {
    if (options.redis?.use && this.redis) {
      const getMaxDelay = options.redis.getMaxDelay || this.getMaxDelay;
      const setMaxDelay = options.redis.setMaxDelay ?? this.setMaxDelay;
      const moduleTtl = options.redis.ttl || this.ttl;
      switch (module.constructor.name) {
        case Mollitia.Ratelimit.name: {
          this.moduleOverride(module as Mollitia.Ratelimit, getMaxDelay, setMaxDelay, moduleTtl);
          break;
        }
        case Mollitia.SlidingCountBreaker.name:
        case Mollitia.SlidingTimeBreaker.name: {
          this.moduleOverride(module as Mollitia.SlidingWindowBreaker, getMaxDelay, setMaxDelay, moduleTtl);
          break;
        }
        default:
          break;
      }
    }
  }
}

