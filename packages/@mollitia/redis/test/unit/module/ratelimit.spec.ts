import { redisMock, setRedisOptions } from '../../helper/redis-mock.js';
import { describe, it, vi, expect } from 'vitest';
import * as Mollitia from 'mollitia';
import * as RedisStorage from '../../../src/index.js';
const redisAddon = new RedisStorage.RedisAddon({ url:'redis://localhost:6379', logger: console });
vi.mock('redis', () => {
  return redisMock;
});
redisAddon['redis']!['initializePromise'] = new Promise<void>((resolve) => resolve());

Mollitia.use(redisAddon);

const successAsync = vi.fn().mockImplementation((res: unknown, delay = 1) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(res);
    }, delay);
  });
});

describe('ratelimit with Redis', () => {
  it('No latency on Redis - should check ratelimit module with redis', async () => {
    setRedisOptions({ getDelay: 0, setDelay: 0});
    const rateLimitData = {
      name: 'myRateLimit',
      limitForPeriod: 2,
      limitPeriod: 20000,
      redis: {
        use: true
      }
    };
    const rateLimitData2 = {
      name: 'myRateLimit2',
      limitForPeriod: 2,
      limitPeriod: 20000,
      redis: {
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
    // await delay(10000);
    await rateLimit.clearState();
    await rateLimit2.clearState();
    await circuit1.fn(successAsync).execute('dummy');
    await circuit1Bis.fn(successAsync).execute('dummy');
    await expect(circuit1.fn(successAsync).execute('dummy')).rejects.toThrowError('Ratelimited');
    await circuit2.fn(successAsync).execute('dummy');
    await circuit2.fn(successAsync).execute('dummy');
    await expect(circuit2.fn(successAsync).execute('dummy')).rejects.toThrowError('Ratelimited');
  });
  it('Latency on Redis < max allowed latency - should check ratelimit module with redis', async () => {
    setRedisOptions({ getDelay: 100, setDelay: 1, crash: false});
    const rateLimitData = {
      name: 'myRateLimit',
      limitForPeriod: 2,
      limitPeriod: 20000,
      redis: {
        use: true,
        getMaxDelay: 500,
        setMaxDelay: 500
      }
    };
    const rateLimitData2 = {
      name: 'myRateLimit2',
      limitForPeriod: 2,
      limitPeriod: 20000,
      redis: {
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
  it('Latency on Redis > max allowed latency - should behave as if no redis', async () => {
    setRedisOptions({ getDelay: 500, setDelay: 500});
    const rateLimitData = {
      name: 'myRateLimit',
      limitForPeriod: 2,
      limitPeriod: 20000,
      redis: {
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
});
