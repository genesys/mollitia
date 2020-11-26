class CacheItem<T> {
  public ttl: number;
  public res: T;
  constructor (ttl: number, res: T) {
    this.ttl = ttl;
    this.res = res;
  }
}

export class MapCache {
  // Private Attributes
  private map: Map<any, any>;
  // Constructor
  constructor () {
    this.map = new Map();
  }
  // Public Methods
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public set (ttl: number, ...params: any[]): void {
    this._setLoopMap(this.map, ttl, ...params);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public get<T> (...params: any[]): CacheItem<T>|null {
    return this._getLoopMap<T>(this.map, ...params);
  }
  public clear (): void {
    this._clearLoopMap(this.map);
  }
  // Private Methods
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _setLoopMap (map: Map<any, any>, ttl: number, ...params: any[]): void {
    if (params.length === 2) {
      const ref = {
        map: new Map(),
        cache: new CacheItem(Date.now() + ttl, params[1])
      };
      map.set(params[0], ref);
    } else {
      if (map.get(params[0])) {
        const param = params.splice(0, 1)[0];
        this._setLoopMap(map.get(param).map, ttl, ...params);
      } else {
        const subMap = new Map();
        map.set(params[0], {
          map: subMap
        });
        params.splice(0, 1);
        this._setLoopMap(subMap, ttl, ...params);
      }
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _getLoopMap<T> (map: Map<any, any>, ...params: any[]): CacheItem<T>|null {
    if (!map) {
      return null;
    } else {
      if (params.length === 1) {
        return map.get(params[0]) && map.get(params[0]).cache;
      } else {
        const param = params.splice(0, 1)[0];
        if (map.get(param)) {
          return this._getLoopMap(map.get(param).map, ...params);
        } else {
          return null;
        }
      }
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _clearLoopMap (map: Map<any, any>): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.forEach((item: any) => {
      if (item.map) {
        this._clearLoopMap(item.map);
      }
      if (item.cache && Date.now() > item.cache.ttl) {
        delete item.cache;
      }
    });
  }
}
