import { describe, afterEach, it, vi, expect } from 'vitest';
import { successAsync, failureAsync } from '../../../../../../shared/vite/utils/vitest.js';
import * as Mollitia from 'mollitia';
import * as MollitiaPrometheus from '../../../src/index.js';

Mollitia.use(new MollitiaPrometheus.PrometheusAddon());

describe('retry.ts', () => {
  afterEach(() => {
    successAsync.mockClear();
    failureAsync.mockClear();
  });
  it('should support success_without_retries metric', async () => {
    const retry = new Mollitia.Retry({
      attempts: 1,
      prometheus: {
        name: 'retry'
      }
    });
    const circuit = new Mollitia.Circuit({
      options: {
        prometheus: {
          name: 'circuit'
        },
        modules: [retry]
      }
    });
    expect(retry.prometheus.metrics.success_without_retries).toBeDefined();
    // Classic Circuit
    await circuit.fn(successAsync).execute('dummy', 250);
    await circuit.fn(successAsync).execute('dummy', 100);
    expect(retry.prometheus.metrics.success_without_retries.values['circuit']).toEqual(2);
    // Per Method Circuit
    circuit.prometheus.perMethod = true;
    await circuit.fn(successAsync, 'successAsync').execute('dummy', 250);
    await circuit.fn(successAsync, 'successAsync').execute('dummy', 100);
    expect(retry.prometheus.metrics.success_without_retries.values['circuit_successAsync']).toEqual(2);
  });
  it('should support success_with_retries metric', async () => {
    let currentAttempts = 0;
    const successAsyncAfterNth = vi.fn().mockImplementation((attempts, res: unknown = 'default', delay = 1) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (currentAttempts !== attempts) {
            currentAttempts++;
            reject(res);
          } else {
            currentAttempts = 0;
            resolve(res);
          }
        }, delay);
      });
    });
    const retry = new Mollitia.Retry({
      attempts: 1,
      prometheus: {
        name: 'retry'
      }
    });
    const circuit = new Mollitia.Circuit({
      options: {
        prometheus: {
          name: 'circuit'
        },
        modules: [retry]
      }
    });
    expect(retry.prometheus.metrics.success_with_retries).toBeDefined();
    // Classic Circuit
    await circuit.fn(successAsyncAfterNth).execute(1, 'dummy', 100);
    await circuit.fn(successAsyncAfterNth).execute(1, 'dummy', 100);
    expect(retry.prometheus.metrics.success_with_retries.values['circuit']).toEqual(2);
    // Per Method Circuit
    circuit.prometheus.perMethod = true;
    await circuit.fn(successAsyncAfterNth, 'successAsyncAfterNth').execute(1, 'dummy', 100);
    await circuit.fn(successAsyncAfterNth, 'successAsyncAfterNth').execute(1, 'dummy', 100);
    expect(retry.prometheus.metrics.success_with_retries.values['circuit_successAsyncAfterNth']).toEqual(2);
  });
  it('should support failures_without_retries metric', async () => {
    const retry = new Mollitia.Retry({
      attempts: 0,
      prometheus: {
        name: 'retry'
      }
    });
    const circuit = new Mollitia.Circuit({
      options: {
        prometheus: {
          name: 'circuit'
        },
        modules: [retry]
      }
    });
    expect(retry.prometheus.metrics.failures_without_retries).toBeDefined();
    // Classic Circuit
    await expect(circuit.fn(failureAsync).execute('dummy', 100)).rejects.toEqual('dummy');
    await expect(circuit.fn(failureAsync).execute('dummy', 100)).rejects.toEqual('dummy');
    expect(retry.prometheus.metrics.failures_without_retries.values['circuit']).toEqual(2);
    // Per Method Circuit
    circuit.prometheus.perMethod = true;
    await expect(circuit.fn(failureAsync, 'failureAsync').execute('dummy', 100)).rejects.toEqual('dummy');
    await expect(circuit.fn(failureAsync, 'failureAsync').execute('dummy', 100)).rejects.toEqual('dummy');
    expect(retry.prometheus.metrics.failures_without_retries.values['circuit_failureAsync']).toEqual(2);
  });
  it('should support failures_with_retries metric', async () => {
    const retry = new Mollitia.Retry({
      attempts: 2,
      onRejection: (err, attempt) => {
        // Only cancel rejection on second attempt
        return (attempt === 1) ? false : true;
      },
      prometheus: {
        name: 'retry'
      }
    });
    const circuit = new Mollitia.Circuit({
      options: {
        prometheus: {
          name: 'circuit'
        },
        modules: [retry]
      }
    });
    expect(retry.prometheus.metrics.failures_with_retries).toBeDefined();
    // Classic Circuit
    await expect(circuit.fn(failureAsync).execute('dummy', 100)).rejects.toEqual('dummy');
    await expect(circuit.fn(failureAsync).execute('dummy', 100)).rejects.toEqual('dummy');
    expect(retry.prometheus.metrics.failures_with_retries.values['circuit']).toEqual(2);
    // Per Method Circuit
    circuit.prometheus.perMethod = true;
    await expect(circuit.fn(failureAsync, 'failureAsync').execute('dummy', 100)).rejects.toEqual('dummy');
    await expect(circuit.fn(failureAsync, 'failureAsync').execute('dummy', 100)).rejects.toEqual('dummy');
    expect(retry.prometheus.metrics.failures_with_retries.values['circuit_failureAsync']).toEqual(2);
  });
});
