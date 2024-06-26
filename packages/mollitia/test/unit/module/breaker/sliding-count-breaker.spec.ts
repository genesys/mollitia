import { describe, afterEach, it, expect } from 'vitest';
import * as Mollitia from '../../../../src/index.js';
import { delay } from '../../../../src/helpers/time.js';
import { successAsync, failureAsync } from '../../../../../../shared/vite/utils/vitest.js';

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
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [
          slidingCountBreaker
        ]
      }
    });
    expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.OPENED);
    try {
      await circuit.fn(failureAsync).execute('dummy');
    } catch {
      // Request is executed in opened state - Failing with exception, this is normal situation.
      // The execute request is just there to start timeout to switch from inital state (Opened) to other state (Half Opened) after OpenStateDelay timeout
    }
    await delay(100);
    expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.HALF_OPENED);
  });
  it('Switch to Open when failure rate exceeded', async () => {
    const slidingCountBreaker = new Mollitia.SlidingCountBreaker({
      slidingWindowSize: 10,
      minimumNumberOfCalls: 3,
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
    await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
    await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
    await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
    // Even if 66% of failed requests, circuit is kept closed as last request is success
    expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.CLOSED);
    await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
    expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.OPENED);
  });
  it('Half Open State max duration', async () => {
    const slidingCountBreaker = new Mollitia.SlidingCountBreaker({
      halfOpenStateMaxDelay: 200,
      openStateDelay: 100,
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
    await delay(100);
    expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.HALF_OPENED);
    await delay(100);
    expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.HALF_OPENED);
    await delay(100);
    expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.OPENED);
    await delay(100);
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
    await expect(circuit.fn(successAsync).execute('dummy')).rejects.toThrow('Max allowed requests reached');
  });
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
    // Even if 50% of slow requests, circuit is kept closed as last request is success
    expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.CLOSED);
    await expect(circuit.fn(successAsync).execute('dummy', 150)).resolves.toEqual('dummy');
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
  it('No switch to Open when failures but failure reported as success', async () => {
    const slidingCountBreaker = new Mollitia.SlidingCountBreaker({
      slidingWindowSize: 2,
      minimumNumberOfCalls: 2,
      failureRateThreshold: 60,
      openStateDelay: 20,
      onError: (err) => {
        if (err === 'credentials-issue') {
          return false;
        } else {
          return true;
        }
      }
    });
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [
          slidingCountBreaker
        ]
      }
    });
    await circuit.fn(failureAsync).execute('credentials-issue').catch(()=>{ return; });
    await circuit.fn(failureAsync).execute('credentials-issue').catch(()=>{ return; });
    expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.CLOSED);
    await circuit.fn(failureAsync).execute('real-issue').catch(()=>{ return; });
    expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.CLOSED);
    await circuit.fn(failureAsync).execute('real-issue').catch(()=>{ return; });
    expect(slidingCountBreaker.state).toEqual(Mollitia.BreakerState.OPENED);
  });
});
