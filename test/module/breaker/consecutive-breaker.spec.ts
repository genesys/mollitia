import * as Mollitia from '../../../src/index';
import { delay } from '../../../src/helpers/time';

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

describe('Consecutive Breaker', () => {
  afterEach(() => {
    logger.debug.mockClear();
    logger.info.mockClear();
    logger.warn.mockClear();
    successAsync.mockClear();
    failureAsync.mockClear();
  });
  it('should break after consecutive fails', async () => {
    const consecutiveBreaker = new Mollitia.ConsecutiveBreaker({
      openStateDelay: 20,
      count: 3,
      logger
    });
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [
          consecutiveBreaker
        ]
      }
    });
    await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
    expect(logger.debug).toHaveBeenNthCalledWith(1, 'ConsecutiveBreaker: (1/3)');
    await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
    expect(logger.debug).toHaveBeenNthCalledWith(2, 'ConsecutiveBreaker: (2/3)');
    await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
    expect(logger.debug).toHaveBeenNthCalledWith(3, 'ConsecutiveBreaker: (3/3)');
    expect(logger.debug).toHaveBeenNthCalledWith(4, 'Breaker: Open');
    await expect(circuit.fn(successAsync).execute('dummy')).rejects.toBeInstanceOf(Mollitia.BreakerError);
  });
  it('should go to half open state after delay', async () => {
    const consecutiveBreaker = new Mollitia.ConsecutiveBreaker({
      openStateDelay: 20,
      logger
    });
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [
          consecutiveBreaker
        ]
      }
    });
    await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
    expect(logger.debug).toHaveBeenNthCalledWith(1, 'ConsecutiveBreaker: (1/2)');
    await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
    expect(logger.debug).toHaveBeenNthCalledWith(2, 'ConsecutiveBreaker: (2/2)');
    expect(logger.debug).toHaveBeenNthCalledWith(3, 'Breaker: Open');
    await expect(circuit.fn(successAsync).execute('dummy')).rejects.toBeInstanceOf(Mollitia.BreakerError);
    await delay(20);
    expect(logger.debug).toHaveBeenNthCalledWith(4, 'Breaker: Half Open');
    expect(consecutiveBreaker.state).toEqual(Mollitia.BreakerState.HALF_OPENED);
  });
  it('should use the fallback when the breaker is opened', async () => {
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [
          new Mollitia.Fallback({
            cb (err: Error) {
              if (err instanceof Mollitia.BreakerError) {
                return 'fallback';
              }
              return err;
            }
          }),
          new Mollitia.ConsecutiveBreaker({
            openStateDelay: 10,
            count: 1,
            logger
          })
        ]
      }
    });
    await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
    await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('fallback');
  });
});
