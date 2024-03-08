import * as Mollitia from 'mollitia';
import { RedisClientType, RedisModules, createClient } from 'redis';

export interface CircuitStorage {
  getState(moduleName: string): Promise<Mollitia.SerializableRecord>;
  setState(moduleName: string, state: Mollitia.SerializableRecord[]): Promise<void>;
  clearState(moduleName: string): Promise<void>;
}

export class RedisStorage implements CircuitStorage {
  private client: RedisClientType<RedisModules>;
  private prefix = 'mollitia';
  private initializePromise: Promise<void>;
  constructor(host: string, port: number, password = '') {
    this.client = createClient({
      socket: {
        host,
        port
      },
      disableOfflineQueue: true, //disableOfflineQueue should be set to true to avoid blocking requests when Redis is down
      password
    });
    this.client.on('error', () => {
      //console.log(err);
    });
    this.initializePromise = new Promise<void>((resolve) => {
      this.client.on('ready', () => {
        resolve();
      });
    });
    this.client.connect();
  }
  public async getState(moduleName: string): Promise<Mollitia.SerializableRecord> {
    const data: Mollitia.SerializableRecord = {};
    await this.initializePromise;
    const keys = await this.client.keys(`${this.prefix}::module::${moduleName}::*`);
    for await (const key of keys) {
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
      for await (const key of keys) {
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


