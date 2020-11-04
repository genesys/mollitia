import * as Mollitia from '../../../../../src/index';
import { delay } from '../../../../../src/helpers/time';

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

describe('Sliding Count Breaker', () => {
  afterEach(() => {
    successAsync.mockClear();
    failureAsync.mockClear();
  });
  it('should go to half open state after delay', async () => {
    const slidingTimeBreaker = new Mollitia.SlidingTimeBreaker({
      state: Mollitia.BreakerState.OPENED,
      openStateDelay: 20
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
      minimumNumberOfCalls: 2,
      failureRateThreshold: 60,
      openStateDelay: 20
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
      permittedNumberOfCallsInHalfOpenState: 2
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
    const slidingTimeBreaker = new Mollitia.SlidingTimeBreaker({
      failureRateThreshold: 50,
      openStateDelay: 10,
      slidingWindowSize: 1000,
      minimumNumberOfCalls: 2,
      permittedNumberOfCallsInHalfOpenState: 1,
      slowCallDurationThreshold: 100,
      slowCallRateThreshold: 50
    });
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [
          slidingTimeBreaker
        ]
      }
    });
    await expect(circuit.fn(successAsync).execute('dummy', 150)).resolves.toEqual('dummy');
    await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
    expect(slidingTimeBreaker.state).toEqual(Mollitia.BreakerState.OPENED);
    await delay(10);
    await expect(circuit.fn(successAsync).execute('dummy', 150)).resolves.toEqual('dummy');
    expect(slidingTimeBreaker.state).toEqual(Mollitia.BreakerState.OPENED);
    await delay(10);
    await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
    expect(slidingTimeBreaker.state).toEqual(Mollitia.BreakerState.CLOSED);
  });
});
