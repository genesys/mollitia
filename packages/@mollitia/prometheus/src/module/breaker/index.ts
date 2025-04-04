import * as Mollitia from 'mollitia';
import { PrometheusModuleOptions } from '../index.js';
import { commonMetrics, getMetricName, PrometheusCommonMetrics } from '../../common.js';
import { PrometheusMetric } from '../../metrics/index.js';
import { PrometheusCounter } from '../../metrics/counter.js';
import { assertNever } from '../../assert.js';
import { PrometheusGauge } from '../../metrics/gauge.js';

interface PrometheusBreakerMetrics extends PrometheusCommonMetrics {
  [key: string]: PrometheusMetric;
}

export interface PrometheusBreakerData extends PrometheusModuleOptions {
  metrics: PrometheusBreakerMetrics;
  scrap (): string;
}

export const attachMetrics = (module: Mollitia.Module, options: Mollitia.ModuleOptions): PrometheusBreakerMetrics => {
  const metrics = commonMetrics(module, options);
  const labels = {
    ...options.prometheus?.labels,
    module: options.prometheus?.name || ''
  };
  let finalMetrics = { ...metrics };
  if (module instanceof Mollitia.SlidingWindowBreaker) {
    // Breaker State
    const closed_breaker_state = new PrometheusCounter(
      `${options.prometheus?.prefix ? `${options.prometheus.prefix}_` : ''}breaker_state`,
      {
        description: 'Breaker State',
        labels: {
          ...labels,
          state: 'closed'
        }
      }
    );
    const half_opened_breaker_state = new PrometheusCounter(
      `${options.prometheus?.prefix ? `${options.prometheus.prefix}_` : ''}breaker_state`,
      {
        description: 'Breaker State',
        labels: {
          ...labels,
          state: 'half-opened'
        }
      }
    );
    const opened_breaker_state = new PrometheusCounter(
      `${options.prometheus?.prefix ? `${options.prometheus.prefix}_` : ''}breaker_state`,
      {
        description: 'Breaker State',
        labels: {
          ...labels,
          state: 'opened'
        }
      }
    );
    // Failure Rate
    const failure_rate = new PrometheusGauge(
      `${options.prometheus?.prefix ? `${options.prometheus.prefix}_` : ''}failure_rate`,
      {
        description: 'Failure Rate (%)',
        labels
      }
    );
    const slow_rate = new PrometheusGauge(
      `${options.prometheus?.prefix ? `${options.prometheus.prefix}_` : ''}slow_rate`,
      {
        description: 'Slow Rate (%)',
        labels
      }
    );
    function setModuleStateMetrics (state: Mollitia.BreakerState) {
      const metricName = options.prometheus!.name;
      closed_breaker_state.reset(metricName);
      half_opened_breaker_state.reset(metricName);
      opened_breaker_state.reset(metricName);
      switch (state) {
        case Mollitia.BreakerState.CLOSED: {
          closed_breaker_state.inc(1, metricName);
          break;
        }
        case Mollitia.BreakerState.HALF_OPENED: {
          half_opened_breaker_state.inc(1, metricName);
          break;
        }
        case Mollitia.BreakerState.OPENED: {
          opened_breaker_state.inc(1, metricName);
          break;
        }
        default: {
          assertNever(state);
        }
      }
    }
    setModuleStateMetrics(module.state ?? Mollitia.BreakerState.CLOSED);
    module.on('state-changed', setModuleStateMetrics);
    module.on('execute', async (_: Mollitia.Circuit, promise: Promise<any>) => {
      const metricName = getMetricName(module);
      try {
        await promise;
      } catch {
        /* We just want to compute metrics on "finally" */
      } finally {
        const state = await module.getState();
        const totalFailures = state.requests.filter(({ result }) => result === Mollitia.SlidingWindowRequestResult.FAILURE).length;
        const totalTimeouts = state.requests.filter(({ result }) => result === Mollitia.SlidingWindowRequestResult.TIMEOUT).length;
        const total = state.requests.length;
        const failureRate = (total > 0) ? (totalFailures / total * 100) : 0;
        const slowRate = (total > 0) ? (totalTimeouts / total * 100) : 0;
        failure_rate.set(failureRate, metricName);
        slow_rate.set(slowRate, metricName);
      }
    });
    finalMetrics = {
      ...metrics,
      closed_breaker_state,
      half_opened_breaker_state,
      opened_breaker_state,
      failure_rate,
      slow_rate
    };
  }
  return finalMetrics;
};
