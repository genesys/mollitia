import * as Mollitia from 'mollitia';
import { PrometheusModuleOptions } from './index.js';
import { commonMetrics, PrometheusCommonMetrics } from '../common.js';
import { PrometheusMetric } from '../metrics/index.js';
import { PrometheusCounter } from '../metrics/counter.js';

interface PrometheusTimeoutMetrics extends PrometheusCommonMetrics {
  [key: string]: PrometheusMetric;
  total_failures_timeout: PrometheusCounter;
}

export interface PrometheusTimeoutData extends PrometheusModuleOptions {
  metrics: PrometheusTimeoutMetrics;
  scrap (): string;
}

export const attachMetrics = (module: Mollitia.Module, options: Mollitia.ModuleOptions): PrometheusTimeoutMetrics => {
  const metrics = commonMetrics(module, options);
  const labels = { ...options.prometheus?.labels, module: options.prometheus?.name || '' };
  // Total Timeout Failures
  const total_failures_timeout = new PrometheusCounter(
    `${options.prometheus?.prefix ? `${options.prometheus?.prefix}_` : ''}total_failures_timeout`,
    {
      description: 'Total Timeout Failures',
      labels
    }
  );
  module.on('timeout', () => {
    total_failures_timeout.inc(1, module.prometheus.name);
  });
  return {
    ...metrics,
    total_failures_timeout
  };
};
