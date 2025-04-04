import { describe, afterEach, it, expect } from 'vitest';
import { successAsync, failureAsync } from '../../../../../../../shared/vite/utils/vitest.js';
import * as Mollitia from 'mollitia';
import * as MollitiaPrometheus from '../../../../src/index.js';

Mollitia.use(new MollitiaPrometheus.PrometheusAddon());

const delay = (delay = 1) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
};

describe('module/breaker/index.ts', () => {
  afterEach(() => {
    successAsync.mockClear();
    failureAsync.mockClear();
  });
  it('should support breaker_state metric', async () => {
    const sliding_count_breaker = new Mollitia.SlidingCountBreaker({
			failureRateThreshold: 75,
			slowCallRateThreshold: 100,
			minimumNumberOfCalls: 4,
			halfOpenStateMaxDelay: 1000,
			openStateDelay: 1000,
			slowCallDurationThreshold: 500,
      prometheus: {
        name: 'sliding_count_breaker'
      }
    });
    const circuit = new Mollitia.Circuit({
      options: {
        prometheus: {
          name: 'circuit'
        },
        modules: [sliding_count_breaker]
      }
    });
    expect(sliding_count_breaker.prometheus.metrics.closed_breaker_state).toBeDefined();
		expect(sliding_count_breaker.prometheus.metrics.half_opened_breaker_state).toBeDefined();
		expect(sliding_count_breaker.prometheus.metrics.opened_breaker_state).toBeDefined();
		expect(sliding_count_breaker.prometheus.metrics.closed_breaker_state.values['sliding_count_breaker']).toEqual(1);
		expect(sliding_count_breaker.prometheus.metrics.half_opened_breaker_state.values['sliding_count_breaker']).toEqual(0);
		expect(sliding_count_breaker.prometheus.metrics.opened_breaker_state.values['sliding_count_breaker']).toEqual(0);
		// Only one success for now
		await circuit.fn(successAsync, 'successAsync').execute('dummy', 100);
		await delay(100);
    expect(sliding_count_breaker.prometheus.metrics.closed_breaker_state.values['sliding_count_breaker']).toEqual(1);
		expect(sliding_count_breaker.prometheus.metrics.half_opened_breaker_state.values['sliding_count_breaker']).toEqual(0);
		expect(sliding_count_breaker.prometheus.metrics.opened_breaker_state.values['sliding_count_breaker']).toEqual(0);
		expect(sliding_count_breaker.prometheus.metrics.failure_rate.values['sliding_count_breaker']).toEqual(0);
		expect(sliding_count_breaker.prometheus.metrics.slow_rate.values['sliding_count_breaker']).toEqual(0);
		// First failure, no state change for now
		await expect(circuit.fn(failureAsync).execute('dummy', 100)).rejects.toEqual('dummy');
		await delay(100);
    expect(sliding_count_breaker.prometheus.metrics.closed_breaker_state.values['sliding_count_breaker']).toEqual(1);
		expect(sliding_count_breaker.prometheus.metrics.half_opened_breaker_state.values['sliding_count_breaker']).toEqual(0);
		expect(sliding_count_breaker.prometheus.metrics.opened_breaker_state.values['sliding_count_breaker']).toEqual(0);
		expect(sliding_count_breaker.prometheus.metrics.failure_rate.values['sliding_count_breaker']).toEqual(50);
		expect(sliding_count_breaker.prometheus.metrics.slow_rate.values['sliding_count_breaker']).toEqual(0);
		// Second failure, we almost reach the limit
		await expect(circuit.fn(failureAsync).execute('dummy', 100)).rejects.toEqual('dummy');
		await delay(100);
    expect(sliding_count_breaker.prometheus.metrics.closed_breaker_state.values['sliding_count_breaker']).toEqual(1);
		expect(sliding_count_breaker.prometheus.metrics.half_opened_breaker_state.values['sliding_count_breaker']).toEqual(0);
		expect(sliding_count_breaker.prometheus.metrics.opened_breaker_state.values['sliding_count_breaker']).toEqual(0);
		expect(sliding_count_breaker.prometheus.metrics.failure_rate.values['sliding_count_breaker']).toEqual(2 / 3 * 100);
		expect(sliding_count_breaker.prometheus.metrics.slow_rate.values['sliding_count_breaker']).toEqual(0);
		// Too much failures, we are opening the circuit
		await expect(circuit.fn(failureAsync).execute('dummy', 100)).rejects.toEqual('dummy');
		await delay(100);
    expect(sliding_count_breaker.prometheus.metrics.closed_breaker_state.values['sliding_count_breaker']).toEqual(0);
		expect(sliding_count_breaker.prometheus.metrics.half_opened_breaker_state.values['sliding_count_breaker']).toEqual(0);
		expect(sliding_count_breaker.prometheus.metrics.opened_breaker_state.values['sliding_count_breaker']).toEqual(1);
		expect(sliding_count_breaker.prometheus.metrics.failure_rate.values['sliding_count_breaker']).toEqual(0);
		expect(sliding_count_breaker.prometheus.metrics.slow_rate.values['sliding_count_breaker']).toEqual(0);
		// Waiting for half-open state
		await delay(1000);
		expect(sliding_count_breaker.prometheus.metrics.closed_breaker_state.values['sliding_count_breaker']).toEqual(0);
		expect(sliding_count_breaker.prometheus.metrics.half_opened_breaker_state.values['sliding_count_breaker']).toEqual(1);
		expect(sliding_count_breaker.prometheus.metrics.opened_breaker_state.values['sliding_count_breaker']).toEqual(0);
		expect(sliding_count_breaker.prometheus.metrics.failure_rate.values['sliding_count_breaker']).toEqual(0);
		expect(sliding_count_breaker.prometheus.metrics.slow_rate.values['sliding_count_breaker']).toEqual(0);
		// First success during half open state
		await circuit.fn(successAsync, 'successAsync').execute('dummy', 100);
		await delay(100);
    expect(sliding_count_breaker.prometheus.metrics.closed_breaker_state.values['sliding_count_breaker']).toEqual(0);
		expect(sliding_count_breaker.prometheus.metrics.half_opened_breaker_state.values['sliding_count_breaker']).toEqual(1);
		expect(sliding_count_breaker.prometheus.metrics.opened_breaker_state.values['sliding_count_breaker']).toEqual(0);
		expect(sliding_count_breaker.prometheus.metrics.failure_rate.values['sliding_count_breaker']).toEqual(0);
		expect(sliding_count_breaker.prometheus.metrics.slow_rate.values['sliding_count_breaker']).toEqual(0);
		// Second success during half open state, we have now a closed circuit
		await circuit.fn(successAsync, 'successAsync').execute('dummy', 100);
		await delay(100);
    expect(sliding_count_breaker.prometheus.metrics.closed_breaker_state.values['sliding_count_breaker']).toEqual(1);
		expect(sliding_count_breaker.prometheus.metrics.half_opened_breaker_state.values['sliding_count_breaker']).toEqual(0);
		expect(sliding_count_breaker.prometheus.metrics.opened_breaker_state.values['sliding_count_breaker']).toEqual(0);
		expect(sliding_count_breaker.prometheus.metrics.failure_rate.values['sliding_count_breaker']).toEqual(0);
		expect(sliding_count_breaker.prometheus.metrics.slow_rate.values['sliding_count_breaker']).toEqual(0);
		// Adding a success request with a closed circuit
		await circuit.fn(successAsync, 'successAsync').execute('dummy', 100);
		await delay(100);
    expect(sliding_count_breaker.prometheus.metrics.closed_breaker_state.values['sliding_count_breaker']).toEqual(1);
		expect(sliding_count_breaker.prometheus.metrics.half_opened_breaker_state.values['sliding_count_breaker']).toEqual(0);
		expect(sliding_count_breaker.prometheus.metrics.opened_breaker_state.values['sliding_count_breaker']).toEqual(0);
		expect(sliding_count_breaker.prometheus.metrics.failure_rate.values['sliding_count_breaker']).toEqual(0);
		expect(sliding_count_breaker.prometheus.metrics.slow_rate.values['sliding_count_breaker']).toEqual(0);
		// Adding a slow request to ensure slow_rate is valid
		await circuit.fn(successAsync, 'successAsync').execute('dummy', 600);
		await delay(100);
    expect(sliding_count_breaker.prometheus.metrics.closed_breaker_state.values['sliding_count_breaker']).toEqual(1);
		expect(sliding_count_breaker.prometheus.metrics.half_opened_breaker_state.values['sliding_count_breaker']).toEqual(0);
		expect(sliding_count_breaker.prometheus.metrics.opened_breaker_state.values['sliding_count_breaker']).toEqual(0);
		expect(sliding_count_breaker.prometheus.metrics.failure_rate.values['sliding_count_breaker']).toEqual(0);
		expect(sliding_count_breaker.prometheus.metrics.slow_rate.values['sliding_count_breaker']).toEqual(50);
  });
});
