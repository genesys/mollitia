interface CacheItem {
  ttl: number;
  res: any;
}

export class MapCache {
  // Private Attributes
  private map: Map<any, any>;
  private ttls: any[];
  // Constructor
  constructor () {
    this.map = new Map();
    this.ttls = [];
  }
  // Public Methods
  public set (ttl: number, ...params: any[]): void {
    this._setLoopMap(this.map, ttl, ...params);
  }
  public get (...params: any[]): any {
    return this._getLoopMap(this.map, ...params);
  }
  // Private Methods
  private _setLoopMap (map: Map<any, any>, ttl: number, ...params: any[]): void {
    if (params.length === 2) {
      const ref = {
        map: new Map(),
        cache: {
          ttl: Date.now() + ttl,
          res: params[1]
        } as CacheItem|undefined
      };
      map.set(params[0], ref);
      this.ttls.push(setTimeout(() => {
        delete ref.cache;
      }, ttl));
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
  private _getLoopMap (map: Map<any, any>, ...params: any[]): any {
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
}
