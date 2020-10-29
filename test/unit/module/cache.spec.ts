import * as Mollitia from '../../src/index';
import { delay } from '../../src/helpers/time';

const logger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn()
};

const successAsync = jest.fn().mockImplementation((res: unknown = 'default', delay = 1) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(res);
    }, delay);
  });
});

const failureAsync = jest.fn().mockImplementation((res: unknown = 'default', delay = 1) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(res);
    }, delay);
  });
});

describe('Cache', () => {
  afterEach(() => {
    logger.debug.mockClear();
    logger.info.mockClear();
    logger.warn.mockClear();
    successAsync.mockClear();
    failureAsync.mockClear();
  });
  it('should cache the previous response', async () => {
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [
          new Mollitia.Cache({
            logger,
            ttl: 100
          })
        ]
      }
    });
    await expect(circuit.fn(successAsync).execute()).resolves.toEqual('default');
    await expect(circuit.fn(successAsync).execute()).resolves.toEqual('default');
    expect(logger.debug).toHaveBeenNthCalledWith(1, 'Cache: Hit');
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
    expect(logger.debug).toHaveBeenNthCalledWith(2, 'Cache: Hit');
    await expect(circuit.fn(successAsync).execute(objRef2)).resolves.toEqual(objRef2);
    expect(logger.debug).not.toHaveBeenNthCalledWith(3, 'Cache: Hit');
    await delay(150);
    await expect(circuit.fn(successAsync).execute()).resolves.toEqual('default');
    expect(logger.debug).not.toHaveBeenNthCalledWith(3, 'Cache: Hit');
  });
});
