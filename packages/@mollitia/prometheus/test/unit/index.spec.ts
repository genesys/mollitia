import { describe, it, vi, expect } from 'vitest';
import * as Mollitia from 'mollitia';
import * as MollitiaPrometheus from '../../src/index.js';

Mollitia.use(new MollitiaPrometheus.PrometheusAddon());

const successAsync = vi.fn().mockImplementation((res: unknown, delay = 1) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(res);
    }, delay);
  });
});

describe('index.ts', () => {
  it('should add metrics to circuits and modules', async () => {
    const timeout = new Mollitia.Timeout({
      delay: 0,
      prometheus: {
        name: 'timeout',
        labels: {
          tag1: 'val1'
        }
      }
    });
    const circuit1 = new Mollitia.Circuit({
      options: {
        prometheus: {
          name: 'circuit1',
          labels: {
            tag2: 'val2',
            tag3: 'val3'
          }
        },
        modules: [timeout]
      }
    });
    const circuit2 = new Mollitia.Circuit({
      options: {
        prometheus: {
          name: 'circuit2'
        },
        modules: [timeout]
      }
    });
    expect(timeout.prometheus.metrics.total_executions).toBeDefined();
    await circuit1.fn(successAsync).execute();
    expect(circuit1.prometheus.metrics.total_executions.values['circuit1']).toEqual(1);
    expect(timeout.prometheus.metrics.total_executions.values['circuit1']).toEqual(1);
    await circuit2.fn(successAsync).execute();
    await circuit2.fn(successAsync).execute();
    expect(circuit2.prometheus.metrics.total_executions.values['circuit2']).toEqual(2);
    expect(timeout.prometheus.metrics.total_executions.values['circuit2']).toEqual(2);
    // Global
    const metrics = MollitiaPrometheus.metrics();
    expect(metrics.total_executions.circuits.circuit1).toEqual(1);
    expect(metrics.total_executions.circuits.circuit2).toEqual(2);
    expect(metrics.total_executions.modules.timeout.circuit1).toEqual(1);
    expect(metrics.total_executions.modules.timeout.circuit2).toEqual(2);
    const scrap = MollitiaPrometheus.scrap();
    expect(typeof scrap).toEqual('string');
  });
});
