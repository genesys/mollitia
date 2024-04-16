import * as Mollitia from 'mollitia';
import { RedisClientType, RedisModules, createClient } from 'redis';
import { RedisAddonOptions } from './index.js';

export interface CircuitStorage {
  getState(moduleName: string): Promise<Mollitia.SerializableRecord>;
  setState(moduleName: string, state: Mollitia.SerializableRecord[]): Promise<void>;
  clearState(moduleName: string): Promise<void>;
}

export class RedisStorage implements CircuitStorage {
  private client: RedisClientType<RedisModules>;
  private prefix = 'mollitia';
  private initializePromise: Promise<void>;
  private logger?: Mollitia.Logger;
  constructor(options: RedisAddonOptions) {
    const clientInfo: { disableOfflineQueue: boolean, url?: string, username?: string, password?: string, socket: { host?: string, port?: number, reconnectStrategy?: () => number } } = {
      socket: {
        reconnectStrategy: () => 500
      },
      disableOfflineQueue: true //disableOfflineQueue should be set to true to avoid blocking requests when Redis is down
    };
    if (options.password) {
      clientInfo.password = options.password;
    }
    if (options.username) {
      clientInfo.username = options.username;
    }
    if (options.url) {
      clientInfo.url = options.url;
    } else {
      clientInfo.socket.host = options.host!;
      clientInfo.socket.port = options.port!;
    }
    this.client = createClient(clientInfo);
    this.logger = options.logger;
    this.initializePromise = new Promise<void>((resolve) => {
      this.client.on('ready', () => {
        this.logger?.debug('Redis Ready');
        resolve();
      });
      // This error handler should be kept, otherwise the reconnection mechanism does not work
      this.client.on('error', () => {
        this.logger?.debug('Redis Connection Error');
      });
    });
    this.client.connect();
  }
  public async getState(moduleName: string): Promise<Mollitia.SerializableRecord> {
    const data: Mollitia.SerializableRecord = {};
    await this.initializePromise;
    const keys = await this.client.keys(`${this.prefix}::module::${moduleName}::*`);
    for (const key of keys) {
      const val = await this.client.get(key);
      if (val) {
        try {
          data[key.substring(key.lastIndexOf('::') + 2)] = JSON.parse(val);
        } catch {
          // value is not a json
        }
      }
    }
    return data;
  }
  public async setState(moduleName: string, state: Mollitia.SerializableRecord[], ttl = 0): Promise<void> {
    await this.initializePromise;
    for await (const stateElem of state) {
      const keyName = this.getKeyName(moduleName, stateElem['key'] as string);
      if (!stateElem['value']) {
        await this.client.del(keyName);
      } else {
        await this.client.set(keyName, JSON.stringify(stateElem['value']));
        if (ttl) {
          this.client.expire(keyName, Math.ceil(ttl / 1000));
        }
      }
    }
  }
  public async clearState(moduleName: string): Promise<void> {
    try {
      const keys = await this.client.keys(`${this.prefix}::module::${moduleName}::*`);
      for (const key of keys) {
        await this.client.del(key);
      }
    } catch {
      // Redis is not available
    }
  }
  private getKeyName(moduleName: string, key: string): string {
    return key ?
      `${this.prefix}::module::${moduleName}::${key}` :
      `${this.prefix}::module::${moduleName}`;
  }
}


