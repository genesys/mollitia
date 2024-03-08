import { redisMock } from '../../../helper/redis-mock.js';
import { describe, afterEach, it, expect, vi } from 'vitest';
import * as Mollitia from 'mollitia';
import { successAsync, failureAsync } from '../../../../../../../shared/vite/utils/vitest.js';
import * as RedisStorage from '../../../../src/index.js';

vi.mock('redis', () => {
  return redisMock;
});

const storageAddOn = new RedisStorage.StorageAddon({ host: 'localhost', port: 6379, password: '' });
((storageAddOn as any).storage as any).initializePromise = new Promise<void>((resolve) => resolve());
Mollitia.use(storageAddOn);

const delay = (delay = 1) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
};

describe('Sliding Time Breaker', () => {
  afterEach(() => {
    successAsync.mockClear();
    failureAsync.mockClear();
  });
  it('should go to half open state after delay - TB', async () => {
    const slidingTimeBreaker = new Mollitia.SlidingTimeBreaker({
      state: Mollitia.BreakerState.OPENED,
      openStateDelay: 20,
      storage: {
        use: true
      }
    });
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [
          slidingTimeBreaker
        ]
      }
    });
    await slidingTimeBreaker.clearState();
    await expect(circuit.fn(successAsync).execute('dummy')).rejects.toThrowError('Circuit is opened');
    expect(slidingTimeBreaker.state).toEqual(Mollitia.BreakerState.OPENED);
    await delay(30);
    expect(slidingTimeBreaker.state).toEqual(Mollitia.BreakerState.HALF_OPENED);
  });
  it('switch to Open when failure rate exceeded - TB', async () => {
    const breakerData = {
      slidingWindowSize: 100,
      minimumNumberOfCalls: 3,
      failureRateThreshold: 70,
      openStateDelay: 2000,
      storage: {
        use: true
      },
      name: 'mySlidingTimeBreaker1'
    };
    const breakerData2 = {
      slidingWindowSize: 100,
      minimumNumberOfCalls: 3,
      failureRateThreshold: 70,
      openStateDelay: 2000,
      storage: {
        use: true
      },
      name: 'mySlidingTimeBreaker2'
    };
    const slidingTimeBreaker = new Mollitia.SlidingTimeBreaker(breakerData);
    const slidingTimeBreaker2 = new Mollitia.SlidingTimeBreaker(breakerData);
    const slidingTimeBreaker3 = new Mollitia.SlidingTimeBreaker(breakerData2);
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [slidingTimeBreaker]
      }
    });
    const circuit2 = new Mollitia.Circuit({
      options: {
        modules: [slidingTimeBreaker2]
      }
    });
    const circuit3 = new Mollitia.Circuit({
      options: {
        modules: [slidingTimeBreaker3]
      }
    });
    await slidingTimeBreaker.clearState();
    await slidingTimeBreaker3.clearState();
    await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
    await expect(circuit2.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
    await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
    expect(slidingTimeBreaker.state).toEqual(Mollitia.BreakerState.CLOSED);
    await expect(circuit2.fn(failureAsync).execute('dummy', 150)).rejects.toEqual('dummy');
    await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
    expect(slidingTimeBreaker2.state).toEqual(Mollitia.BreakerState.CLOSED);
    await expect(circuit2.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
    expect(slidingTimeBreaker2.state).toEqual(Mollitia.BreakerState.OPENED);
    await expect(circuit2.fn(successAsync).execute('dummy')).rejects.toThrowError('Circuit is opened');
    await expect(circuit3.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
    await expect(circuit3.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
    expect(slidingTimeBreaker2.state).toEqual(Mollitia.BreakerState.OPENED);
    expect(slidingTimeBreaker3.state).toEqual(Mollitia.BreakerState.CLOSED);
    await expect(circuit3.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
    expect(slidingTimeBreaker3.state).toEqual(Mollitia.BreakerState.OPENED);
  });
  it('Half Open State switch to Closed/Opened - TB', async () => {
    const breakerData = {
      failureRateThreshold: 50,
      openStateDelay: 10,
      state: Mollitia.BreakerState.HALF_OPENED,
      permittedNumberOfCallsInHalfOpenState: 2,
      storage: {
        use: true
      },
      name: 'mySlidingTimeBreaker3'
    };
    const slidingTimeBreaker = new Mollitia.SlidingTimeBreaker(breakerData);
    const slidingTimeBreaker2 = new Mollitia.SlidingTimeBreaker(breakerData);
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [slidingTimeBreaker]
      }
    });
    const circuit2 = new Mollitia.Circuit({
      options: {
        modules: [slidingTimeBreaker2]
      }
    });
    await slidingTimeBreaker.clearState();
    await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
    await expect(circuit2.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
    expect(slidingTimeBreaker2.state).toEqual(Mollitia.BreakerState.OPENED);
    await delay(20);
    expect(slidingTimeBreaker2.state).toEqual(Mollitia.BreakerState.HALF_OPENED);
    await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
    await expect(circuit2.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
    expect(slidingTimeBreaker2.state).toEqual(Mollitia.BreakerState.CLOSED);
  });
  it('Slow Requests - TB', async () => {
    const breakerData = {
      failureRateThreshold: 50,
      openStateDelay: 10,
      slidingWindowSize: 1000,
      minimumNumberOfCalls: 2,
      permittedNumberOfCallsInHalfOpenState: 1,
      slowCallDurationThreshold: 100,
      slowCallRateThreshold: 50,
      storage: {
        use: true
      },
      name: 'mySlidingTimeBreaker4'
    };
    const slidingTimeBreaker = new Mollitia.SlidingTimeBreaker(breakerData);
    const slidingTimeBreaker2 = new Mollitia.SlidingTimeBreaker(breakerData);
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [slidingTimeBreaker]
      }
    });
    const circuit2 = new Mollitia.Circuit({
      options: {
        modules: [slidingTimeBreaker2]
      }
    });
    await slidingTimeBreaker.clearState();
    await expect(circuit.fn(successAsync).execute('dummy', 150)).resolves.toEqual('dummy');
    await expect(circuit2.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
    // Even if 50% of slow requests, circuit is kept closed as last request is success
    expect(slidingTimeBreaker2.state).toEqual(Mollitia.BreakerState.CLOSED);
    await expect(circuit.fn(successAsync).execute('dummy', 150)).resolves.toEqual('dummy');
    expect(slidingTimeBreaker.state).toEqual(Mollitia.BreakerState.OPENED);
    await delay(150);
    expect(slidingTimeBreaker.state).toEqual(Mollitia.BreakerState.HALF_OPENED);
    await expect(circuit2.fn(successAsync).execute('dummy', 150)).resolves.toEqual('dummy');
    expect(slidingTimeBreaker2.state).toEqual(Mollitia.BreakerState.OPENED);
    await delay(10);
    await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
    expect(slidingTimeBreaker.state).toEqual(Mollitia.BreakerState.CLOSED);
  });

  describe('Redis TTL - Sliding Time', () => {
    it('Should use slidingTimeBreaker TTL for SlidingTimeBreaker module', async () => {
      const moduleName = 'mySlidingTimeBreaker5';
      const breakerData = {
        openStateDelay: 1000,
        slidingWindowSize: 1000,
        minimumNumberOfCalls: 2,
        failureRateThreshold: 60,
        permittedNumberOfCallsInHalfOpenState: 1,
        storage: {
          use: true
        },
        name: moduleName
      };
      const slidingTimeBreaker = new Mollitia.SlidingTimeBreaker(breakerData);
      const slidingTimeBreaker2 = new Mollitia.SlidingTimeBreaker(breakerData);
      const circuit = new Mollitia.Circuit({
        options: {
          modules: [slidingTimeBreaker]
        }
      });
      const circuit2 = new Mollitia.Circuit({
        options: {
          modules: [slidingTimeBreaker2]
        }
      });
      await slidingTimeBreaker.clearState();
      await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
      await expect(circuit2.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
      expect(slidingTimeBreaker2.state).toEqual(Mollitia.BreakerState.CLOSED);
      await delay(500);
      let res = await storageAddOn.getStateWithStorage(moduleName, 1000);
      expect(JSON.stringify(res)).toContain('requests');
      await delay(500);
      // Delay to wait TTL -> Redis storage is cleared
      res = await storageAddOn.getStateWithStorage(moduleName, 1000);
      expect(JSON.stringify(res)).toEqual('{}');
      // So even if a request fails, the circuit is closed because this is the only request stored
      await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
      expect(slidingTimeBreaker.state).toEqual(Mollitia.BreakerState.CLOSED);
    });
    it('Should ignore module storage ttl for SlidingTimeBreaker module, and use TTL from SlidingTimeBreaker', async () => {
      const moduleName = 'mySlidingTimeBreaker6';
      const breakerData = {
        openStateDelay: 1000,
        slidingWindowSize: 2000,
        minimumNumberOfCalls: 2,
        failureRateThreshold: 60,
        permittedNumberOfCallsInHalfOpenState: 1,
        storage: {
          use: true,
          ttl: 1000
        },
        name: moduleName
      };
      const slidingTimeBreaker = new Mollitia.SlidingTimeBreaker(breakerData);
      const slidingTimeBreaker2 = new Mollitia.SlidingTimeBreaker(breakerData);
      const circuit = new Mollitia.Circuit({
        options: {
          modules: [slidingTimeBreaker]
        }
      });
      const circuit2 = new Mollitia.Circuit({
        options: {
          modules: [slidingTimeBreaker2]
        }
      });
      await slidingTimeBreaker.clearState();
      await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
      await expect(circuit2.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
      expect(slidingTimeBreaker2.state).toEqual(Mollitia.BreakerState.CLOSED);
      // Delay to wait is > module storage TTL but < slidingWindowSize, so Redis Storage is not cleared
      await delay(1100);
      const res = await storageAddOn.getStateWithStorage(moduleName, 1000);
      expect(JSON.stringify(res)).toContain('requests');
      // Hence, another request failure leads to circuit being opened
      await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
      expect(slidingTimeBreaker.state).toEqual(Mollitia.BreakerState.OPENED);
    });
  });
});
