import { redisMock } from '../../../helper/redis-mock.js';
import { describe, afterEach, it, expect, vi } from 'vitest';
import * as Mollitia from 'mollitia';
import { successAsync, failureAsync } from '../../../../../../../shared/vite/utils/vitest.js';
import { StorageAddon } from '../../../../src/index.js';


vi.mock('redis', () => {
  return redisMock
});

const storageAddOn = new StorageAddon({ host: 'localhost', port: 6379, password: '', ttl: 1000 });
((storageAddOn as any).storage as any).initializePromise = new Promise<void>((resolve) => resolve());
Mollitia.use(storageAddOn);

const delay = (delay = 1) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
};

describe('Sliding Count Breaker - Redis TTL - With Redis Storage TTL', () => {
  afterEach(() => {
    successAsync.mockClear();
    failureAsync.mockClear();
  });
  it('Should use module storage TTL if found - SB', async () => {
    const moduleName = 'mySlidingCountBreaker9';
    const breakerData = {
      slidingWindowSize: 3,
      minimumNumberOfCalls: 2,
      storage: {
        use: true,
        ttl: 2000
      },
      name: moduleName
    };
    const slidingCountBreaker = new Mollitia.SlidingCountBreaker(breakerData);
    const slidingCountBreaker2 = new Mollitia.SlidingCountBreaker(breakerData);
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [slidingCountBreaker]
      }
    });
    const circuit2 = new Mollitia.Circuit({
      options: {
        modules: [slidingCountBreaker2]
      }
    });
    await slidingCountBreaker.clearState();
    await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
    await expect(circuit2.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
    expect(slidingCountBreaker2.state).toEqual(Mollitia.BreakerState.CLOSED);
    await delay(1200);
    const res = await storageAddOn.getStateWithStorage(moduleName, 1000);
    expect(JSON.stringify(res)).toContain('requests');
    await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
    expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.OPENED);
  });
  it('Should use redis storage storage TTL if no ttl configured in module', async () => {
    const moduleName = 'mySlidingCountBreaker10';
    const breakerData = {
      slidingWindowSize: 3,
      minimumNumberOfCalls: 2,
      storage: {
        use: true
      },
      name: moduleName
    };
    const slidingCountBreaker = new Mollitia.SlidingCountBreaker(breakerData);
    const slidingCountBreaker2 = new Mollitia.SlidingCountBreaker(breakerData);
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [slidingCountBreaker]
      }
    });
    const circuit2 = new Mollitia.Circuit({
      options: {
        modules: [slidingCountBreaker2]
      }
    });
    await slidingCountBreaker.clearState();
    await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
    await expect(circuit2.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
    expect(slidingCountBreaker2.state).toEqual(Mollitia.BreakerState.CLOSED);
    await delay(1200);
    const res = await storageAddOn.getStateWithStorage(moduleName, 1000);
    expect(JSON.stringify(res)).toEqual('{}');
    await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
    expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.CLOSED);
  });
});
