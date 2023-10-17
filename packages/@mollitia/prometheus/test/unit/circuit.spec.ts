import { describe, it, vi, expect } from 'vitest';
import * as Mollitia from 'mollitia';
import * as MollitiaPrometheus from '../../src/index.js';

Mollitia.use(new MollitiaPrometheus.PrometheusAddon());

const delay = (delay = 1) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
};

const successAsync = vi.fn().mockImplementation((res: unknown, delay = 1) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(res);
    }, delay);
  });
});

describe('circuit.ts', () => {
  it('should allow method based metrics', async () => {
    const timeout = new Mollitia.Timeout({
      delay: 100,
      prometheus: {
        name: 'timeout'
      }
    });
    const circuit = new Mollitia.Circuit({
      options: {
        prometheus: {
          name: 'circuit',
          perMethod: true
        },
        modules: [timeout]
      }
    });
    expect(timeout.prometheus.metrics.total_executions).toBeDefined();
    await circuit.fn(successAsync, 'successAsync1').execute();
    expect(circuit.prometheus.metrics.total_executions.values['circuit_successAsync1']).toEqual(1);
    expect(timeout.prometheus.metrics.total_executions.values['circuit_successAsync1']).toEqual(1);
    await circuit.fn(successAsync, 'successAsync2').execute();
    expect(circuit.prometheus.metrics.total_executions.values['circuit_successAsync2']).toEqual(1);
    expect(timeout.prometheus.metrics.total_executions.values['circuit_successAsync2']).toEqual(1);
  });
  it('should get min, max and ave circuit execution duration', async () => {
    const timeout = new Mollitia.Timeout({
      delay: 1000,
      prometheus: {
        name: 'timeout'
      }
    });
    const circuit = new Mollitia.Circuit({
      options: {
        prometheus: {
          name: 'circuit'
        },
        modules: [timeout]
      }
    });
    expect(timeout.prometheus.metrics.total_executions).toBeDefined();
    await circuit.fn(successAsync).execute('dummy', 100);
    await circuit.fn(successAsync).execute('dummy', 200);
    await circuit.fn(successAsync).execute('dummy', 300);
    await circuit.fn(successAsync).execute('dummy', 400);
    await circuit.fn(successAsync).execute('dummy', 500);
    expect(circuit.prometheus.metrics.total_executions.values['circuit']).toEqual(5);
    expect(timeout.prometheus.metrics.total_executions.values['circuit']).toEqual(5);
    await delay(100);
    expect(circuit.prometheus.metrics.duration_min.values['circuit']).toBeAround(100, 20);
    expect(circuit.prometheus.metrics.duration_ave.values['circuit']).toBeAround(300, 20);
    expect(circuit.prometheus.metrics.duration_max.values['circuit']).toBeAround(500, 20);
  });
});
