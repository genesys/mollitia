import { describe, afterEach, it, vi, expect } from 'vitest';
import * as Mollitia from '../../../src/index.js';
import { delay } from '../../../src/helpers/time.js';
import { successAsync, failureAsync, multiSuccessAsync } from '../../../../../shared/vite/utils/vitest.js';

const logger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn()
};

describe('Cache', () => {
  afterEach(() => {
    logger.debug.mockClear();
    logger.info.mockClear();
    logger.warn.mockClear();
    successAsync.mockClear();
    failureAsync.mockClear();
  });
  it('should cache the previous response by reference', async () => {
    const circuit = new Mollitia.Circuit({
      name: 'circuit-cache',
      options: {
        modules: [
          new Mollitia.Cache({
            name: 'module-cache',
            logger,
            ttl: 100
          })
        ]
      }
    });
    await expect(circuit.fn(successAsync).execute('default')).resolves.toEqual('default');
    await expect(circuit.fn(successAsync).execute('default')).resolves.toEqual('default');
    expect(logger.debug).toHaveBeenNthCalledWith(1, 'circuit-cache/module-cache - Cache: Hit');
    const objRef = {
      dummy: 'value1',
      dummy2: 'value2'
    };
    const objRef2 = {
      dummy: 'value1',
      dummy2: 'value3'
    };
    await expect(circuit.fn(successAsync).execute(objRef)).resolves.toEqual(objRef);
    objRef.dummy2 = 'value3';
    await expect(circuit.fn(successAsync).execute(objRef)).resolves.toEqual(objRef);
    expect(logger.debug).toHaveBeenNthCalledWith(2, 'circuit-cache/module-cache - Cache: Hit');
    await expect(circuit.fn(successAsync).execute(objRef2)).resolves.toEqual(objRef2);
    expect(logger.debug).not.toHaveBeenNthCalledWith(3, 'circuit-cache/module-cache - Cache: Hit');
    await delay(150);
    await expect(circuit.fn(successAsync).execute('default')).resolves.toEqual('default');
    expect(logger.debug).not.toHaveBeenNthCalledWith(3, 'circuit-cache/module-cache - Cache: Hit');
    circuit.dispose();
  });

  it('should cache the previous response - using onCache parameter', async () => {
    const cacheModule = new Mollitia.Cache({
      name: 'module-cache',
      logger,
      ttl: 100
    });
    const circuit = new Mollitia.Circuit({
      name: 'circuit-cache',
      options: {
        modules: [ cacheModule ]
      }
    });
    const objRef = { dummy: 'value1' };
    const objRef2 = { dummy2: 'value2' };
    const objRef3 = { dummy3: 'value3' };
    await expect(circuit.fn(multiSuccessAsync).execute(objRef, objRef2)).resolves.toEqual({ res: objRef, res2: objRef2 });
    await expect(circuit.fn(multiSuccessAsync).execute(objRef, objRef3)).resolves.toEqual({ res: objRef, res2: objRef3 });
    expect(logger.debug).not.toHaveBeenNthCalledWith(1, 'circuit-cache/module-cache - Cache: Hit');

    await delay(150);
    cacheModule.adjustCacheParams = (_, ...params) => {
      return params.slice(1);
    };
    await expect(circuit.fn(multiSuccessAsync).execute(objRef, objRef2)).resolves.toEqual({ res: objRef, res2: objRef2 });
    await expect(circuit.fn(multiSuccessAsync).execute(objRef, objRef3)).resolves.toEqual({ res: objRef, res2: objRef3 });
    expect(logger.debug).not.toHaveBeenNthCalledWith(1, 'circuit-cache/module-cache - Cache: Hit');
    await expect(circuit.fn(multiSuccessAsync).execute(objRef2, objRef)).resolves.toEqual({ res: objRef2, res2: objRef });
    await expect(circuit.fn(multiSuccessAsync).execute(objRef2, objRef)).resolves.toEqual({ res: objRef2, res2: objRef });
    expect(logger.debug).toHaveBeenNthCalledWith(1, 'circuit-cache/module-cache - Cache: Hit');

    await delay(150);
    cacheModule.adjustCacheParams = (_, ...params) => {
      return params.slice(0,1);
    };
    await expect(circuit.fn(multiSuccessAsync).execute(objRef, objRef2)).resolves.toEqual({ res: objRef, res2: objRef2 });
    await expect(circuit.fn(multiSuccessAsync).execute(objRef, objRef2)).resolves.toEqual({ res: objRef, res2: objRef2 });
    expect(logger.debug).toHaveBeenNthCalledWith(2, 'circuit-cache/module-cache - Cache: Hit');
    circuit.dispose();
  });

  it('With multiple modules - Cache module in the middle of the modules - Cache the previous response by reference', async () => {
    const moduleRetry = new Mollitia.Retry({
      attempts: 2
    });
    const moduleCache = new Mollitia.Cache({
      name: 'module-cache',
      logger,
      ttl: 100
    });
    const moduleRateLimit = new Mollitia.Ratelimit({
      limitPeriod: 1000,
      limitForPeriod: 3,
      name: 'dummy-name'
    });

    const circuit = new Mollitia.Circuit({
      name: 'circuit-cache',
      options: {
        modules: [ moduleRetry, moduleCache, moduleRateLimit ]
      }
    });
    const objRef = {
      dummy: 'value1',
      dummy2: 'value2'
    };
    await expect(circuit.fn(successAsync).execute(objRef)).resolves.toEqual(objRef);
    await expect(circuit.fn(successAsync).execute(objRef)).resolves.toEqual(objRef);
    expect(logger.debug).toHaveBeenNthCalledWith(1, 'circuit-cache/module-cache - Cache: Hit');
    circuit.dispose();
  });

  it('With multiple modules - Cache module is the first module - Cache the previous response by reference', async () => {
    const moduleRetry = new Mollitia.Retry({
      attempts: 2
    });
    const moduleCache = new Mollitia.Cache({
      name: 'module-cache',
      logger,
      ttl: 100
    });
    const moduleRateLimit = new Mollitia.Ratelimit({
      limitPeriod: 1000,
      limitForPeriod: 3,
      name: 'dummy-name'
    });

    const circuit = new Mollitia.Circuit({
      name: 'circuit-cache',
      options: {
        modules: [ moduleCache, moduleRetry, moduleRateLimit ]
      }
    });
    const objRef = {
      dummy: 'value1',
      dummy2: 'value2'
    };
    await expect(circuit.fn(successAsync).execute(objRef)).resolves.toEqual(objRef);
    await expect(circuit.fn(successAsync).execute(objRef)).resolves.toEqual(objRef);
    expect(logger.debug).toHaveBeenNthCalledWith(1, 'circuit-cache/module-cache - Cache: Hit');
    circuit.dispose();
  });

  it('With multiple modules - Cache module is the last module - Cache the previous response by reference', async () => {
    const moduleRetry = new Mollitia.Retry({
      attempts: 2
    });
    const moduleCache = new Mollitia.Cache({
      name: 'module-cache',
      logger,
      ttl: 100
    });
    const moduleRateLimit = new Mollitia.Ratelimit({
      limitPeriod: 1000,
      limitForPeriod: 3,
      name: 'dummy-name'
    });

    const circuit = new Mollitia.Circuit({
      name: 'circuit-cache',
      options: {
        modules: [ moduleRetry, moduleRateLimit, moduleCache ]
      }
    });
    const objRef = {
      dummy: 'value1',
      dummy2: 'value2'
    };
    await expect(circuit.fn(successAsync).execute(objRef)).resolves.toEqual(objRef);
    await expect(circuit.fn(successAsync).execute(objRef)).resolves.toEqual(objRef);
    expect(logger.debug).toHaveBeenNthCalledWith(1, 'circuit-cache/module-cache - Cache: Hit');
    circuit.dispose();
  });

  it('should have a cache interval', async () => {
    let shouldFail = false;
    const requestAsync = vi.fn().mockImplementation((res: unknown, delay = 1) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (shouldFail) {
            reject(res);
          } else {
            resolve(res);
          }
        }, delay);
      });
    });
    const cache =  new Mollitia.Cache({
      name: 'module-cache',
      logger,
      ttl: 100,
      cacheClearInterval: 1000
    });
    const circuit = new Mollitia.Circuit({
      name: 'circuit-cache',
      options: {
        modules: [
          cache
        ]
      }
    });
    await expect(circuit.fn(requestAsync).execute('default')).resolves.toEqual('default');
    await expect(circuit.fn(requestAsync).execute('default')).resolves.toEqual('default');
    expect(logger.debug).toHaveBeenNthCalledWith(1, 'circuit-cache/module-cache - Cache: Hit');
    await delay(150);
    shouldFail = true;
    await expect(circuit.fn(requestAsync).execute('default')).resolves.toEqual('default');
    expect(logger.debug).toHaveBeenNthCalledWith(2, 'circuit-cache/module-cache - Cache: Hit [Old]');
    await delay(1000);
    expect(logger.debug).toHaveBeenNthCalledWith(3, 'module-cache - Cache: Clear');
    await expect(circuit.fn(requestAsync).execute('default')).rejects.toEqual('default');
    circuit.dispose();
  });
});
