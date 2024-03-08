import { redisMock, setRedisOptions } from '../../helper/redis-mock.js';
import { describe, it, vi, expect } from 'vitest';
import * as Mollitia from 'mollitia';
import * as RedisStorage from '../../../src/index.js';

vi.mock('redis', () => {
  return redisMock;
});

const storageAddOn = new RedisStorage.StorageAddon({ host: 'localhost', port: 6379, password: '' });
((storageAddOn as any).storage as any).initializePromise = new Promise<void>((resolve) => resolve());
Mollitia.use(storageAddOn);

const successAsync = vi.fn().mockImplementation((res: unknown, delay = 1) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(res);
    }, delay);
  });
});

describe('ratelimit with Redis storage', () => {
  it('No latency on Redis - should check ratelimit module with storage', async () => {
    setRedisOptions({ getDelay: 0, setDelay: 0});
    const rateLimitData = {
      name: 'myRateLimit',
      limitForPeriod: 2,
      limitPeriod: 20000,
      storage: {
        use: true
      }
    };
    const rateLimitData2 = {
      name: 'myRateLimit2',
      limitForPeriod: 2,
      limitPeriod: 20000,
      storage: {
        use: true
      }
    };
    const rateLimit = new Mollitia.Ratelimit(rateLimitData);
    const rateLimitBis = new Mollitia.Ratelimit(rateLimitData);
    const rateLimit2 = new Mollitia.Ratelimit(rateLimitData2);
    const circuit1 = new Mollitia.Circuit({
      options: {
        modules: [rateLimit]
      }
    });
    const circuit1Bis = new Mollitia.Circuit({
      options: {
        modules: [rateLimitBis]
      }
    });
    const circuit2 = new Mollitia.Circuit({
      options: {
        modules: [rateLimit2]
      }
    });
    await rateLimit.clearState();
    await rateLimit2.clearState();
    await circuit1.fn(successAsync).execute('dummy');
    await circuit1Bis.fn(successAsync).execute('dummy');
    await expect(circuit1.fn(successAsync).execute('dummy')).rejects.toThrowError('Ratelimited');
    await circuit2.fn(successAsync).execute('dummy');
    await circuit2.fn(successAsync).execute('dummy');
    await expect(circuit2.fn(successAsync).execute('dummy')).rejects.toThrowError('Ratelimited');
  });
  it('Latency on Redis < max allowed latency - should check ratelimit module with storage', async () => {
    setRedisOptions({ getDelay: 100, setDelay: 1, crash: false});
    const rateLimitData = {
      name: 'myRateLimit',
      limitForPeriod: 2,
      limitPeriod: 20000,
      storage: {
        use: true,
        getMaxDelay: 500,
        setMaxDelay: 500
      }
    };
    const rateLimitData2 = {
      name: 'myRateLimit2',
      limitForPeriod: 2,
      limitPeriod: 20000,
      storage: {
        use: true,
        getMaxDelay: 500,
        setMaxDelay: 500
      }
    };
    const rateLimit = new Mollitia.Ratelimit(rateLimitData);
    const rateLimitBis = new Mollitia.Ratelimit(rateLimitData);
    const rateLimit2 = new Mollitia.Ratelimit(rateLimitData2);
    const circuit1 = new Mollitia.Circuit({
      options: {
        modules: [rateLimit]
      }
    });
    const circuit1Bis = new Mollitia.Circuit({
      options: {
        modules: [rateLimitBis]
      }
    });
    const circuit2 = new Mollitia.Circuit({
      options: {
        modules: [rateLimit2]
      }
    });
    await rateLimit.clearState();
    await rateLimit2.clearState();
    await circuit1.fn(successAsync).execute('dummy');
    await circuit1Bis.fn(successAsync).execute('dummy');
    await expect(circuit1.fn(successAsync).execute('dummy')).rejects.toThrowError('Ratelimited');
    await circuit2.fn(successAsync).execute('dummy');
    await circuit2.fn(successAsync).execute('dummy');
    await expect(circuit2.fn(successAsync).execute('dummy')).rejects.toThrowError('Ratelimited');
  });
  it('Latency on Redis > max allowed latency - should behave as if no storage', async () => {
    setRedisOptions({ getDelay: 500, setDelay: 500});
    const rateLimitData = {
      name: 'myRateLimit',
      limitForPeriod: 2,
      limitPeriod: 20000,
      storage: {
        use: true,
        getMaxDelay: 100,
        setMaxDelay: 100
      }
    };
    const rateLimit = new Mollitia.Ratelimit(rateLimitData);
    const rateLimitBis = new Mollitia.Ratelimit(rateLimitData);
    const circuit1 = new Mollitia.Circuit({
      options: {
        modules: [rateLimit]
      }
    });
    const circuit1Bis = new Mollitia.Circuit({
      options: {
        modules: [rateLimitBis]
      }
    });
    await rateLimit.clearState();
    await circuit1.fn(successAsync).execute('dummy');
    await circuit1Bis.fn(successAsync).execute('dummy');
    await circuit1.fn(successAsync).execute('dummy');
    await circuit1Bis.fn(successAsync).execute('dummy');
    await expect(circuit1.fn(successAsync).execute('dummy')).rejects.toThrowError('Ratelimited');
    await expect(circuit1.fn(successAsync).execute('dummy')).rejects.toThrowError('Ratelimited');
  });
  // it('Redis is no longer working - Should behave as if no storage', async () => {
  //   setRedisOptions({ getDelay: 0, setDelay: 0, crash: true});
  //   const rateLimitData = {
  //     name: 'myRateLimit',
  //     limitForPeriod: 2,
  //     limitPeriod: 20000,
  //     storage: {
  //       use: true,
  //     }
  //   };
  //   const rateLimit = new Mollitia.Ratelimit(rateLimitData);
  //   const rateLimitBis = new Mollitia.Ratelimit(rateLimitData);
  //   const circuit1 = new Mollitia.Circuit({
  //     options: {
  //       modules: [rateLimit]
  //     }
  //   });
  //   const circuit1Bis = new Mollitia.Circuit({
  //     options: {
  //       modules: [rateLimitBis]
  //     }
  //   });
  //   await rateLimit.clearState();
  //   await circuit1.fn(successAsync).execute('dummy');
  //   await circuit1Bis.fn(successAsync).execute('dummy');
  //   await circuit1.fn(successAsync).execute('dummy');
  //   await circuit1Bis.fn(successAsync).execute('dummy');
  //   await expect(circuit1.fn(successAsync).execute('dummy')).rejects.toThrowError('Ratelimited');
  //   await expect(circuit1.fn(successAsync).execute('dummy')).rejects.toThrowError('Ratelimited');
  // });
});
