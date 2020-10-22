import { Module, ModuleOptions } from '.';
import { Circuit } from '../circuit';
import { MapCache } from '../helpers/map-cache';

// TODO
interface CacheOptions extends ModuleOptions {
  ttl?: number;
}

/**
 * TODO
 */
export class Cache extends Module {
  // Public Attributes
  public ttl: number;
  // Private Attributes
  private cache: MapCache;
  // Constructor
  constructor (options?: CacheOptions) {
    super(options);
    this.ttl = options?.ttl || Infinity;
    this.cache = new MapCache();
  }
  // Public Methods
  public async execute<T> (circuit: Circuit, promise: any, ...params: any[]): Promise<T> {
    return new Promise((resolve, reject) => {
      this.emit('execute', circuit);
      const cacheRes = this.cache.get(promise, ...circuit.params);
      if (cacheRes) {
        const now = Date.now();
        if (this.ttl !== Infinity && (cacheRes.ttl < now)) {
          promise(...params)
            .then((res: any) => {
              if (this.ttl > 0) {
                this.cache.set(this.ttl, promise, ...circuit.params, res);
              }
              resolve(res);
            })
            .catch((err: Error) => {
              reject(err);
            });
        } else {
          this.logger?.debug('Cache: Hit');
          resolve(cacheRes.res);
        }
      } else {
        promise(...params)
          .then((res: any) => {
            if (this.ttl > 0) {
              this.cache.set(this.ttl, promise, ...circuit.params, res);
            }
            resolve(res);
          })
          .catch((err: Error) => {
            reject(err);
          });
      }
    });
  }
}
