import * as Mollitia from '../../../../src/index';
import { delay } from '../../../../src/helpers/time';

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
    const slidingCountBreaker = new Mollitia.SlidingCountBreaker({
      state: Mollitia.BreakerState.OPENED,
      openStateDelay: 20
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
      openStateDelay: 20
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
      permittedNumberOfCallsInHalfOpenState: 1,
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
      permittedNumberOfCallsInHalfOpenState: 2
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
      permittedNumberOfCallsInHalfOpenState: 2
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
      permittedNumberOfCallsInHalfOpenState: 1,
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
