import * as Mollitia from '../src/index';
import { delay } from '../src/helpers/time';

const logger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn()
};

const successAsync = jest.fn().mockImplementation((res: unknown, delay = 1) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(res);
    }, delay);
  });
});

const failureAsync = jest.fn().mockImplementation((res: unknown, delay = 1) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(res);
    }, delay);
  });
});

describe('mollitia.ts', () => {
  afterEach(() => {
    logger.debug.mockClear();
    logger.info.mockClear();
    logger.warn.mockClear();
    successAsync.mockClear();
    failureAsync.mockClear();
  });
  // Defaults
  describe('_defaults', () => {
    it('should export the Circuit class', () => {
      expect(Mollitia.Circuit).toBeDefined();
      expect(Mollitia.circuits.length).toEqual(0);
    });
  });
  // Circuit
  describe('Circuit', () => {
    it('should reject if no function has been set', async () => {
      const circuit = new Mollitia.Circuit();
      await expect(circuit.execute()).rejects.toBeInstanceOf(Mollitia.NoFuncError);
    });
    it('should execute the function', async () => {
      // If the function has been set in factory
      let circuit = new Mollitia.Circuit({
        func: successAsync
      });
      expect(circuit.execute('dummy')).resolves.toEqual('dummy');
      // If the function has been set via fn
      circuit = new Mollitia.Circuit();
      await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
    });
  });
  // Modules
  describe('Modules', () => {
    describe('Specifications', () => {
      describe('Timeout', () => {
        it('should timeout the function for circuit', async () => {
          const circuit = new Mollitia.Circuit({
            options: {
              modules: [
                new Mollitia.Timeout({
                  delay: 5
                })
              ]
            }
          });
          await expect(circuit.fn(successAsync).execute('dummy', 10)).rejects.toBeInstanceOf(Mollitia.TimeoutError);
        });
      });
      describe('Retry', () => {
        it('should retry the function multiple times', async () => {
          const retry = new Mollitia.Retry({
            attempts: 2,
            logger
          });
          const circuit = new Mollitia.Circuit({
            options: {
              modules: [
                retry
              ]
            }
          });
          await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
          expect(logger.debug).toHaveBeenNthCalledWith(1, 'Retry: (1/2)');
          expect(logger.debug).toHaveBeenNthCalledWith(2, 'Retry: (2/2)');
        });
      });
      describe('ConsecutiveBreaker', () => {
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
      });
      describe('SlidingCountBreaker', () => {
        it('should go to half open state after delay', async () => {
          const slidingCountBreaker = new Mollitia.SlidingCountBreaker({
            state: Mollitia.BreakerState.OPENED,
            openStateDelay: 20,
            logger
          });
          new Mollitia.Circuit({
            options: {
              modules: [
                slidingCountBreaker
              ]
            }
          });
          expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.OPENED);
          await delay(30);
          expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.HALF_OPENED);
        });
        it('Switch to Open when failure rate exceeded', async () => {
          const slidingCountBreaker = new Mollitia.SlidingCountBreaker({
            slidingWindowSize: 10,
            minimumNumberOfCalls: 2,
            failureRateThreshold: 60,
            openStateDelay: 20,
            logger
          });
          const circuit = new Mollitia.Circuit({
            options: {
              modules: [
                slidingCountBreaker
              ]
            }
          });
          await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
          await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
          expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.CLOSED);
          await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
          expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.OPENED);
        });
        it('Half Open State max duration', async () => {
          const slidingCountBreaker = new Mollitia.SlidingCountBreaker({
            halfOpenStateMaxDelay: 20,
            openStateDelay: 10,
            state: Mollitia.BreakerState.HALF_OPENED,
            permittedNumberOfCallsInHalfOpenSate: 1,
            minimumNumberOfCalls: 1
          });
          const circuit = new Mollitia.Circuit({
            options: {
              modules: [
                slidingCountBreaker
              ]
            }
          });
          await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
          expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.OPENED);
          await delay(10);
          expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.HALF_OPENED);
          await delay(10);
          expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.HALF_OPENED);
          await delay(10);
          expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.OPENED);
          await delay(10);
          await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
          expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.CLOSED);
          await delay(100);
        });
        it('Half Open State switch to Closed/Opened', async () => {
          const slidingCountBreaker = new Mollitia.SlidingCountBreaker({
            failureRateThreshold: 50,
            openStateDelay: 10,
            state: Mollitia.BreakerState.HALF_OPENED,
            permittedNumberOfCallsInHalfOpenSate: 2
          });
          const circuit = new Mollitia.Circuit({
            options: {
              modules: [
                slidingCountBreaker
              ]
            }
          });
          await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
          expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.HALF_OPENED);
          await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
          expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.OPENED);
          await delay(10);
          expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.HALF_OPENED);
          await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
          await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
          expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.CLOSED);
        });
        it('Half Open State - Request should fail if max permitted calls in half opened reached', async () => {
          const slidingCountBreaker = new Mollitia.SlidingCountBreaker({
            failureRateThreshold: 50,
            openStateDelay: 10,
            state: Mollitia.BreakerState.HALF_OPENED,
            permittedNumberOfCallsInHalfOpenSate: 2
          });
          const circuit = new Mollitia.Circuit({
            options: {
              modules: [
                slidingCountBreaker
              ]
            }
          });
          await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
          expect(circuit.fn(failureAsync).execute('dummy', 50)).rejects.toEqual('dummy');
          expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.HALF_OPENED);
          await expect(circuit.fn(successAsync).execute('dummy')).rejects.toThrow('Circuit is half opened and max allowed request in this state has been reached');
        })
        it('Slow Requests', async () => {
          const slidingCountBreaker = new Mollitia.SlidingCountBreaker({
            failureRateThreshold: 50,
            openStateDelay: 10,
            slidingWindowSize: 10,
            minimumNumberOfCalls: 2,
            permittedNumberOfCallsInHalfOpenSate: 1,
            slowCallDurationThreshold: 100,
            slowCallRateThreshold: 50
          });
          const circuit = new Mollitia.Circuit({
            options: {
              modules: [
                slidingCountBreaker
              ]
            }
          });
          await expect(circuit.fn(successAsync).execute('dummy', 150)).resolves.toEqual('dummy');
          await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
          expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.OPENED);
          await delay(10);
          await expect(circuit.fn(successAsync).execute('dummy', 150)).resolves.toEqual('dummy');
          expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.OPENED);
          await delay(10);
          await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
          expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.CLOSED);
        });
        it('Nb Max Requests reached', async () => {
          const slidingCountBreaker = new Mollitia.SlidingCountBreaker({
            failureRateThreshold: 50,
            openStateDelay: 10,
            slidingWindowSize: 5,
            minimumNumberOfCalls: 3,
          });
          const circuit = new Mollitia.Circuit({
            options: {
              modules: [
                slidingCountBreaker
              ]
            }
          });
          await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
          await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
          await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
          expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.CLOSED);
          await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
          await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
          expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.CLOSED);
          await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
          expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.CLOSED);
          await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
          expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.OPENED);
        });
      });
      describe('SlidingTimeBreaker', () => {
        it('should go to half open state after delay', async () => {
          const slidingTimeBreaker = new Mollitia.SlidingTimeBreaker({
            state: Mollitia.BreakerState.OPENED,
            openStateDelay: 20,
            logger
          });
          new Mollitia.Circuit({
            options: {
              modules: [
                slidingTimeBreaker
              ]
            }
          });
          expect(slidingTimeBreaker.state).toEqual(Mollitia.BreakerState.OPENED);
          await delay(30);
          expect(slidingTimeBreaker.state).toEqual(Mollitia.BreakerState.HALF_OPENED);
        });
        it('switch to Open when failure rate exceeded', async () => {
          const slidingTimeBreaker = new Mollitia.SlidingTimeBreaker({
            slidingWindowSize: 100,
            slidingWindowSizeInMs: true,
            minimumNumberOfCalls: 2,
            failureRateThreshold: 60,
            openStateDelay: 20,
            logger
          });
          const circuit = new Mollitia.Circuit({
            options: {
              modules: [
                slidingTimeBreaker
              ]
            }
          });
          await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
          await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
          expect(slidingTimeBreaker.state).toEqual(Mollitia.BreakerState.CLOSED);
          await expect(circuit.fn(failureAsync).execute('dummy', 100)).rejects.toEqual('dummy');
          expect(slidingTimeBreaker.state).toEqual(Mollitia.BreakerState.CLOSED);
          await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
          expect(slidingTimeBreaker.state).toEqual(Mollitia.BreakerState.OPENED);
        });
        it('Half Open State switch to Closed/Opened', async () => {
          const slidingTimeBreaker = new Mollitia.SlidingTimeBreaker({
            failureRateThreshold: 50,
            openStateDelay: 10,
            state: Mollitia.BreakerState.HALF_OPENED,
            permittedNumberOfCallsInHalfOpenSate: 2
          });
          const circuit = new Mollitia.Circuit({
            options: {
              modules: [
                slidingTimeBreaker
              ]
            }
          });
          await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
          await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
          expect(slidingTimeBreaker.state).toEqual(Mollitia.BreakerState.OPENED);
          await delay(20);
          expect(slidingTimeBreaker.state).toEqual(Mollitia.BreakerState.HALF_OPENED);
          await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
          await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
          expect(slidingTimeBreaker.state).toEqual(Mollitia.BreakerState.CLOSED);
        });
        it('Slow Requests', async () => {
          const slidingTimeCounter = new Mollitia.SlidingTimeBreaker({
            failureRateThreshold: 50,
            openStateDelay: 10,
            slidingWindowSize: 1,
            minimumNumberOfCalls: 2,
            permittedNumberOfCallsInHalfOpenSate: 1,
            slowCallDurationThreshold: 100,
            slowCallRateThreshold: 50
          });
          const circuit = new Mollitia.Circuit({
            options: {
              modules: [
                slidingTimeCounter
              ]
            }
          });
          await expect(circuit.fn(successAsync).execute('dummy', 150)).resolves.toEqual('dummy');
          await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
          expect(slidingTimeCounter.state).toEqual(Mollitia.BreakerState.OPENED);
          await delay(10);
          await expect(circuit.fn(successAsync).execute('dummy', 150)).resolves.toEqual('dummy');
          expect(slidingTimeCounter.state).toEqual(Mollitia.BreakerState.OPENED);
          await delay(10);
          await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
          expect(slidingTimeCounter.state).toEqual(Mollitia.BreakerState.CLOSED);
        });
      });
      describe('RateLimiting', () => {
        it('With a single rate limit', async () => {
          const rateLimit = new Mollitia.RateLimit({
            limitPeriod: 1000,
            limitForPeriod: 3,
            logger
          });
          const circuit = new Mollitia.Circuit({
            options: {
              modules: [
                rateLimit
              ]
            }
          });
          await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy'); //0: t0 (0)
          await delay(200);
          await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy'); // 1: t0 + 200ms (0, 200)
          await delay(400);
          await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy'); // 2: t0 + 600ms (0, 200, 600)
          await delay(300);
          await expect(circuit.fn(successAsync).execute('dummy')).rejects.toBeInstanceOf(Mollitia.RateLimitError); //t0 + 900ms: Already 3 request
          await delay(100);
          await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');//t0 + 1000ms: Ok (200, 600, 1000)
          await delay(100);
          await expect(circuit.fn(successAsync).execute('dummy')).rejects.toBeInstanceOf(Mollitia.RateLimitError);//t0 + 1100ms: Nok
          await delay(100);
          await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');//t0 + 1200ms: Ok (600, 1000, 1200)
          await delay(300);
          await expect(circuit.fn(successAsync).execute('dummy')).rejects.toBeInstanceOf(Mollitia.RateLimitError);//t0 + 1500: Nok
          await delay(200);
          await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');//t0 + 1700ms: Ok (1000, 1200, 1700)
          await delay(200);
          await expect(circuit.fn(successAsync).execute('dummy')).rejects.toBeInstanceOf(Mollitia.RateLimitError);//t0 + 1900: Nok
          await delay(300);
          await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');//t0 + 2200: Ok (1200, 1700, 2200)
          await delay(1);
          await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');//t0 + 2201: Ok (1700, 2200, 2201)
        });
        it('With two rate limits', async () => {
          const rateLimit = new Mollitia.RateLimit({
            limitPeriod: 1000,
            limitForPeriod: 3,
            logger
          });
          const rateLimit2 = new Mollitia.RateLimit({
            limitPeriod: 200,
            limitForPeriod: 1,
            logger
          });
          const circuit = new Mollitia.Circuit({
            options: {
              modules: [
                rateLimit2,
                rateLimit
              ]
            }
          });
          await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');//t0
          await delay(100);
          await expect(circuit.fn(successAsync).execute('dummy')).rejects.toBeInstanceOf(Mollitia.RateLimitError);//t0 + 100: Nok (rateLimit2)
          await delay(100);
          await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');//t0 + 200: Ok (0, 200)
          await delay(500);
          await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');//t0 + 700: Ok (0, 200, 700)
          await delay(200);
          await expect(circuit.fn(successAsync).execute('dummy')).rejects.toBeInstanceOf(Mollitia.RateLimitError);//t0 + 900ms: Nok (0,200,700)
          await delay(400);
          await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');//t0 + 1300ms: Ok (200, 700, 1300)
          await delay(1);
          await expect(circuit.fn(successAsync).execute('dummy')).rejects.toBeInstanceOf(Mollitia.RateLimitError);//t0 + 1301: NOk (rateLimit2)
        });
      });
      describe('Fallback', () => {
        it('should timeout the function for circuit', async () => {
          const circuit = new Mollitia.Circuit({
            options: {
              modules: [
                new Mollitia.Fallback({
                  cb (value: string) {
                    expect(value).toEqual('dummy');
                    return 'fallback';
                  }
                })
              ]
            }
          });
          await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('fallback');
        });
      });
    });
    describe('Features', () => {
      describe('Sequential Usage', () => {
        it('should retry function and use the timeout', async () => {
          const retry = new Mollitia.Retry({
            attempts: 2,
            logger
          });
          const timeout = new Mollitia.Timeout({
            delay: 5,
            logger
          });
          const circuit = new Mollitia.Circuit({
            options: {
              modules: [
                retry,
                timeout
              ]
            }
          });
          await expect(circuit.fn(failureAsync).execute('dummy', 6)).rejects.toBeInstanceOf(Mollitia.TimeoutError);
          expect(logger.debug).toHaveBeenNthCalledWith(1, 'Has timed out');
          expect(logger.debug).toHaveBeenNthCalledWith(2, 'Retry: (1/2)');
          expect(logger.debug).toHaveBeenNthCalledWith(3, 'Has timed out');
          expect(logger.debug).toHaveBeenNthCalledWith(4, 'Retry: (2/2)');
          expect(logger.debug).toHaveBeenNthCalledWith(5, 'Has timed out');
          circuit.modules = [timeout, retry];
          await expect(circuit.fn(failureAsync).execute('dummy', 4)).rejects.toBeInstanceOf(Mollitia.TimeoutError);
          expect(logger.debug).toHaveBeenNthCalledWith(6, 'Retry: (1/2)');
          expect(logger.debug).toHaveBeenNthCalledWith(7, 'Has timed out');
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
        // TODO custom module
      });
    });
  });
  // Plugin
  describe('Plugin', () => {
    it('should call lifecycle methods', async () => {
      const plugin: Mollitia.Plugin = {
        onCircuitCreate: jest.fn(),
        onModuleCreate: jest.fn()
      };
      Mollitia.use(plugin);
      const circuitOptions = {
        modules: []
      };
      const circuit = new Mollitia.Circuit({ options: circuitOptions });
      expect(plugin.onCircuitCreate).toHaveBeenCalledWith(circuit, circuitOptions);
      const timeoutOptions = {
        delay: 0
      };
      const timeout = new Mollitia.Timeout(timeoutOptions);
      expect(plugin.onModuleCreate).toHaveBeenCalledWith(timeout, timeoutOptions);
    });
  });
});
