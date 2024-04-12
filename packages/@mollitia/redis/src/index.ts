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
      use: boolean;
      getMaxDelay?: number;
      setMaxDelay?: number;
      ttl?: number;
    }
  }
}
/**
 * Array containing every modules.
 */
export const modules: Mollitia.Module[] = [];

/**
 * The RedisAddOn Class, that should be added to the core Mollitia module. [Redis Addon]
 * @example
 * Mollitia.use(new RedisStorage.RedisAddOn());
 */
export class RedisAddOn implements Mollitia.Addon {
  private redis;
  private getMaxDelay: number;
  private setMaxDelay: number;
  private ttl: number;
  constructor(configuration: { host: string, port: number, password: string, ttl?: number, getMaxDelay?: number, setMaxDelay?: number }) {
    this.redis = new RedisStorage(configuration.host, configuration.port, configuration.password);
    this.getMaxDelay = configuration.getMaxDelay || 500; //0 for getMaxDelay is not a valid value
    this.setMaxDelay = configuration.setMaxDelay ?? 500;
    this.ttl = configuration.ttl || 0;
  }

  private async getStateWithRedis (moduleName: string, getMaxDelay: number): Promise<Mollitia.SerializableRecord> {
    return new Promise((resolve, reject) => {
      const opTimeout = setTimeout(() => {
        reject();
      }, getMaxDelay);
      try {
        this.redis.getState(moduleName).then((data) => {
          clearTimeout(opTimeout);
          resolve(data);
        });
      }
      catch (e) {
        console.log('Error occurred while trying to get the state from Redis');
        clearTimeout(opTimeout);
        reject();
      }
    });
  }

  private async setStateWithRedis(moduleName: string, state: Mollitia.SerializableRecord[], setMaxDelay: number, ttl: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const opTimeout = setTimeout(() => {
        reject();
      }, setMaxDelay);
      try {
        this.redis.setState(moduleName, state, ttl).then(() => {
          clearTimeout(opTimeout);
          resolve();
        });
      } catch (e) {
        console.log('Error occurred while trying to set the state in Redis');
        clearTimeout(opTimeout);
        reject();
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
      return this.redis.clearState(mod.name);
    }
  }
  onModuleCreate (module: Mollitia.Module, options: Mollitia.ModuleOptions): void {
    if (options.redis?.use) {
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

