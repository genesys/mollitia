import { redisMock } from '../../../helper/redis-mock.js';
import { describe, afterEach, it, expect, vi } from 'vitest';
import * as Mollitia from 'mollitia';
import { successAsync, failureAsync } from '../../../../../../../shared/vite/utils/vitest.js';
import * as RedisStorage from '../../../../src/index.js';

const redisAddon = new RedisStorage.RedisAddon({ host: 'localhost', port: 6379, password: '', ttl: 1000 });
vi.mock('redis', () => {
  return redisMock;
});
redisAddon['redis']!['initializePromise'] = new Promise<void>((resolve) => resolve());
Mollitia.use(redisAddon);

const delay = (delay = 1) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
};

describe('Sliding Count Breaker', () => {
  afterEach(() => {
    successAsync.mockClear();
    failureAsync.mockClear();
  });
  it('should go to half open state after delay - CB', async () => {
    const slidingCountBreaker = new Mollitia.SlidingCountBreaker({
      state: Mollitia.BreakerState.OPENED,
      openStateDelay: 20,
      redis: {
        use: true
      }
    });
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [
          slidingCountBreaker
        ]
      }
    });
    await slidingCountBreaker.clearState();
    await expect(circuit.fn(successAsync).execute('dummy')).rejects.toThrowError('Circuit is opened');
    expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.OPENED);
    await delay(300);
    expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.HALF_OPENED);
  });
  it('Switch to Open when failure rate exceeded - CB', async () => {
    const breakerData = {
      slidingWindowSize: 10,
      minimumNumberOfCalls: 3,
      failureRateThreshold: 60,
      openStateDelay: 2000,
      redis: {
        use: true
      },
      name: 'mySlidingCountBreaker1'
    };
    const breakerData2 = {
      slidingWindowSize: 10,
      minimumNumberOfCalls: 3,
      failureRateThreshold: 60,
      openStateDelay: 2000,
      redis: {
        use: true
      },
      name: 'mySlidingCountBreaker2'
    };
    const slidingCountBreaker = new Mollitia.SlidingCountBreaker(breakerData);
    const slidingCountBreaker2 = new Mollitia.SlidingCountBreaker(breakerData);
    const slidingCountBreaker3 = new Mollitia.SlidingCountBreaker(breakerData2);
    const circuit = new Mollitia.Circuit({
      options: { modules: [ slidingCountBreaker ] }
    });
    const circuit2 = new Mollitia.Circuit({
      options: { modules: [slidingCountBreaker2] }
    });
    const circuit3 = new Mollitia.Circuit({
      options: { modules: [slidingCountBreaker3] }
    });
    await slidingCountBreaker.clearState();
    await slidingCountBreaker3.clearState();
    await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
    await expect(circuit2.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
    await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
    // Even if 66% of failed requests, circuit is kept closed as last request is success
    expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.CLOSED);
    await expect(circuit2.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
    expect(slidingCountBreaker2.state).toEqual(Mollitia.BreakerState.OPENED);
    await expect(circuit2.fn(successAsync).execute('dummy')).rejects.toThrowError('Circuit is opened');
    expect(slidingCountBreaker3.state).toEqual(Mollitia.BreakerState.CLOSED);
    await expect(circuit3.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
    await expect(circuit3.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
    await expect(circuit3.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
    expect(slidingCountBreaker3.state).toEqual(Mollitia.BreakerState.CLOSED);
    expect(slidingCountBreaker2.state).toEqual(Mollitia.BreakerState.OPENED);
    await expect(circuit3.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
    expect(slidingCountBreaker3.state).toEqual(Mollitia.BreakerState.OPENED);
  });
  it('Half Open State max duration - CB', async () => {
    const breakerData = {
      name: 'mySlidingCountBreaker3',
      halfOpenStateMaxDelay: 200,
      openStateDelay: 100,
      failureRateThreshold: 40,
      permittedNumberOfCallsInHalfOpenState: 1,
      minimumNumberOfCalls: 2,
      redis: {
        use: true
      }
    };
    const slidingCountBreaker = new Mollitia.SlidingCountBreaker(breakerData);
    const slidingCountBreaker2 = new Mollitia.SlidingCountBreaker(breakerData);
    const circuit = new Mollitia.Circuit({
      options: { modules: [ slidingCountBreaker ] }
    });
    const circuit2 = new Mollitia.Circuit({
      options: { modules: [ slidingCountBreaker2 ] }
    });
    await slidingCountBreaker.clearState();
    await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
    await expect(circuit2.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
    expect(slidingCountBreaker2.state).toEqual(Mollitia.BreakerState.OPENED);
    await delay(100);
    expect(slidingCountBreaker2.state).toEqual(Mollitia.BreakerState.HALF_OPENED);
    await delay(100);
    expect(slidingCountBreaker2.state).toEqual(Mollitia.BreakerState.HALF_OPENED);
    await delay(100);
    expect(slidingCountBreaker2.state).toEqual(Mollitia.BreakerState.OPENED);
    await expect(circuit.fn(successAsync).execute('dummy')).rejects.toThrowError('Circuit is opened');
    await delay(150);
    expect(slidingCountBreaker2.state).toEqual(Mollitia.BreakerState.HALF_OPENED);
    await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
    expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.CLOSED);
  });
  it('Half Open State switch to Closed/Opened - CB', async () => {
    const breakerData = {
      name: 'mySlidingCountBreaker4',
      failureRateThreshold: 50,
      openStateDelay: 10,
      state: Mollitia.BreakerState.HALF_OPENED,
      permittedNumberOfCallsInHalfOpenState: 2,
      redis: {
        use: true
      }
    };
    const slidingCountBreaker = new Mollitia.SlidingCountBreaker(breakerData);
    const slidingCountBreaker2 = new Mollitia.SlidingCountBreaker(breakerData);
    const circuit = new Mollitia.Circuit({
      options: { modules: [ slidingCountBreaker ] }
    });
    const circuit2 = new Mollitia.Circuit({
      options: { modules: [ slidingCountBreaker2 ] }
    });
    await slidingCountBreaker.clearState();
    await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
    expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.HALF_OPENED);
    await expect(circuit2.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
    expect(slidingCountBreaker2.state).toEqual(Mollitia.BreakerState.OPENED);
    await delay(10);
    expect(slidingCountBreaker2.state).toEqual(Mollitia.BreakerState.HALF_OPENED);
    await expect(circuit2.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
    await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
    expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.CLOSED);
  });
  it('Slow Requests - CB', async () => {
    const breakerData = {
      failureRateThreshold: 50,
      openStateDelay: 10,
      slidingWindowSize: 10,
      minimumNumberOfCalls: 2,
      permittedNumberOfCallsInHalfOpenState: 1,
      slowCallDurationThreshold: 100,
      slowCallRateThreshold: 50,
      name: 'mySlidingCountBreaker5',
      redis: {
        use: true
      }
    };
    const slidingCountBreaker = new Mollitia.SlidingCountBreaker(breakerData);
    const slidingCountBreaker2 = new Mollitia.SlidingCountBreaker(breakerData);
    const circuit = new Mollitia.Circuit({
      options: { modules: [ slidingCountBreaker ] }
    });
    const circuit2 = new Mollitia.Circuit({
      options: { modules: [ slidingCountBreaker2 ] }
    });
    await slidingCountBreaker.clearState();
    await expect(circuit.fn(successAsync).execute('dummy', 150)).resolves.toEqual('dummy');
    await expect(circuit2.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
    // Even if 50% of slow requests, circuit is kept closed as last request is success
    expect(slidingCountBreaker2.state).toEqual(Mollitia.BreakerState.CLOSED);
    await expect(circuit.fn(successAsync).execute('dummy', 150)).resolves.toEqual('dummy');
    expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.OPENED);
    await delay(10);
    await expect(circuit2.fn(successAsync).execute('dummy', 150)).resolves.toEqual('dummy');
    expect(slidingCountBreaker2.state).toEqual(Mollitia.BreakerState.OPENED);
    await delay(10);
    await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
    expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.CLOSED);
  });
  it('Nb Max Requests reached - CB', async () => {
    const breakerData = {
      failureRateThreshold: 50,
      openStateDelay: 10,
      slidingWindowSize: 5,
      minimumNumberOfCalls: 3,
      redis: {
        use: true
      },
      name: 'mySlidingCountBreaker6'
    };
    const slidingCountBreaker = new Mollitia.SlidingCountBreaker(breakerData);
    const slidingCountBreaker2 = new Mollitia.SlidingCountBreaker(breakerData);
    const circuit = new Mollitia.Circuit({
      options: { modules: [ slidingCountBreaker ] }
    });
    const circuit2 = new Mollitia.Circuit({
      options: { modules: [ slidingCountBreaker2 ] }
    });
    await slidingCountBreaker.clearState();
    await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
    await expect(circuit2.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
    await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
    expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.CLOSED);
    await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
    await expect(circuit2.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
    expect(slidingCountBreaker2.state).toEqual(Mollitia.BreakerState.CLOSED);
    await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
    expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.CLOSED);
    await expect(circuit2.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
    expect(slidingCountBreaker2.state).toEqual(Mollitia.BreakerState.OPENED);
  });
  it('No switch to Open when failures but failure reported as success - CB', async () => {
    const breakerData = {
      slidingWindowSize: 2,
      minimumNumberOfCalls: 2,
      failureRateThreshold: 60,
      openStateDelay: 20,
      redis: {
        use: true
      },
      name: 'mySlidingCountBreaker7',
      onError: (err: string) => {
        if (err === 'credentials-issue') {
          return false;
        } else {
          return true;
        }
      }
    };
    const slidingCountBreaker = new Mollitia.SlidingCountBreaker(breakerData);
    const slidingCountBreaker2 = new Mollitia.SlidingCountBreaker(breakerData);
    const circuit = new Mollitia.Circuit({
      options: { modules: [ slidingCountBreaker ] }
    });
    const circuit2 = new Mollitia.Circuit({
      options: { modules: [ slidingCountBreaker2 ] }
    });
    await slidingCountBreaker.clearState();
    await circuit.fn(failureAsync).execute('credentials-issue').catch(()=>{ return; });
    await circuit2.fn(failureAsync).execute('credentials-issue').catch(()=>{ return; });
    expect(slidingCountBreaker2.state).toEqual(Mollitia.BreakerState.CLOSED);
    await circuit.fn(failureAsync).execute('real-issue').catch(()=>{ return; });
    expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.CLOSED);
    await circuit2.fn(failureAsync).execute('real-issue').catch(()=>{ return; });
    expect(slidingCountBreaker2.state).toEqual(Mollitia.BreakerState.OPENED);
  });

  describe('Redis TTL - Sliding Count', () => {
    it('Should use module Redis TTL if found - SCB', async () => {
      const moduleName = 'mySlidingCountBreaker8';
      const breakerData = {
        slidingWindowSize: 3,
        minimumNumberOfCalls: 2,
        openStateDelay: 2000,
        failureRateThreshold: 60,
        redis: {
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
      await delay(100);
      let res = await slidingCountBreaker2.getState();
      expect(JSON.stringify(res)).toContain('requests');
      await delay(1400);
      res = await slidingCountBreaker2.getState();
      expect(JSON.stringify(res)).toContain('requests');
      await delay(500);
      res = await slidingCountBreaker2.getState();
      expect(JSON.stringify(res)).toEqual('{}');
      await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
      expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.CLOSED);
    });
    it('Should use Redis Addon TTL if found and no module TTL- SCB', async () => {
      const moduleName = 'mySlidingCountBreaker9';
      const breakerData = {
        slidingWindowSize: 3,
        minimumNumberOfCalls: 2,
        openStateDelay: 2000,
        failureRateThreshold: 60,
        redis: {
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
      await delay(100);
      let res = await slidingCountBreaker2.getState();
      expect(JSON.stringify(res)).toContain('requests');
      await delay(1000);
      res = await slidingCountBreaker2.getState();
      expect(JSON.stringify(res)).toEqual('{}');
    });
  });
});
