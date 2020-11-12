import { Module, ModuleOptions } from '.';
import { Circuit } from '../circuit';
import { MapCache } from '../helpers/map-cache';

// TODO
interface CacheOptions extends ModuleOptions {
  ttl?: number;
  cacheClearInterval?: number;
}

/**
 * TODO
 */
export class Cache extends Module {
  // Public Attributes
  public ttl: number;
  // Private Attributes
  private cache: MapCache;
  private _cacheClearInterval: number;
  private _cacheInterval: number|null;
  // Computed Attributes
  get cacheClearInterval (): number {
    return this._cacheClearInterval;
  }
  set cacheClearInterval (interval: number) {
    this._cacheClearInterval = interval;
    this._initializeInterval();
  }
  // Constructor
  constructor (options?: CacheOptions) {
    super(options);
    this.ttl = options?.ttl ? options?.ttl : 6000; // 1 minute
    this._cacheInterval = null;
    this._cacheClearInterval = 0;
    this.cacheClearInterval = options?.cacheClearInterval ? options?.cacheClearInterval : 900000; // 15 minutes
    this.cache = new MapCache();
  }
  // Public Methods
  public async execute<T> (circuit: Circuit, promise: any, ...params: any[]): Promise<T> {
    const _exec = this._promiseCache<T>(circuit, promise, ...params);
    this.emit('execute', circuit, _exec);
    return _exec;
  }
  public dispose (): void {
    super.dispose();
    if (this._cacheInterval) {
      clearTimeout(this._cacheInterval);
      this._cacheInterval = null;
    }
  }
  // Private Methods
  private async _promiseCache<T> (circuit: Circuit, promise: any, ...params: any[]): Promise<T> {
    return new Promise((resolve, reject) => {
      const cacheRes = this.cache.get(promise, ...params);
      if (cacheRes) {
        const now = Date.now();
        if (this.ttl !== Infinity && (cacheRes.ttl < now)) {
          promise(...params)
            .then((res: any) => {
              if (this.ttl > 0) {
                this.cache.set(this.ttl, promise, ...params, res);
              }
              resolve(res);
            })
            .catch(() => {
              this.logger?.debug(`${circuit.name}/${this.name} - Cache: Hit [Old]`);
              resolve(cacheRes.res);
            });
        } else {
          this.logger?.debug(`${circuit.name}/${this.name} - Cache: Hit`);
          resolve(cacheRes.res);
        }
      } else {
        promise(...params)
          .then((res: any) => {
            if (this.ttl > 0) {
              this.cache.set(this.ttl, promise, ...params, res);
            }
            resolve(res);
          })
          .catch((err: Error) => {
            reject(err);
          });
      }
    });
  }
  private _initializeInterval () {
    if (this._cacheInterval) {
      clearTimeout(this._cacheInterval);
      this._cacheInterval = null;
    }
    if (this.cacheClearInterval !== 0 && this.cacheClearInterval !== Infinity) {
      this._cacheInterval = <unknown>setTimeout(() => {
        this.logger?.debug(`${this.name} - Cache: Clear`);
        this.cache.clear();
        this._initializeInterval();
      }, this.cacheClearInterval) as number;
    }
  }
}
