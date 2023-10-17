import * as Mollitia from 'mollitia';
import { PrometheusModuleOptions } from './index.js';
import { commonMetrics, getMetricName, PrometheusCommonMetrics } from '../common.js';
import { PrometheusMetric } from '../metrics/index.js';
import { PrometheusCounter } from '../metrics/counter.js';

interface PrometheusRetryMetrics extends PrometheusCommonMetrics {
  [key: string]: PrometheusMetric;
}

export interface PrometheusRetryData extends PrometheusModuleOptions {
  metrics: PrometheusRetryMetrics;
  scrap (): string;
}

export const attachMetrics = (module: Mollitia.Module, options: Mollitia.ModuleOptions): PrometheusRetryMetrics => {
  const metrics = commonMetrics(module, options);
  const labels = {
    ...options.prometheus?.labels,
    module: options.prometheus?.name || ''
  };
  // Success Without Retries
  const success_without_retries = new PrometheusCounter(
    `${options.prometheus?.prefix ? `${options.prometheus?.prefix}_` : ''}success_without_retries`,
    {
      description: 'Success Without Retries',
      labels
    }
  );
  // Success Without Retries
  const success_with_retries = new PrometheusCounter(
    `${options.prometheus?.prefix ? `${options.prometheus?.prefix}_` : ''}success_with_retries`,
    {
      description: 'Success With Retries',
      labels
    }
  );
  // Success Without Retries
  const failures_without_retries = new PrometheusCounter(
    `${options.prometheus?.prefix ? `${options.prometheus?.prefix}_` : ''}failures_without_retries`,
    {
      description: 'Failures Without Retries',
      labels
    }
  );
  // Success Without Retries
  const failures_with_retries = new PrometheusCounter(
    `${options.prometheus?.prefix ? `${options.prometheus?.prefix}_` : ''}failures_with_retries`,
    {
      description: 'Failures With Retries',
      labels
    }
  );

  // Handlers
  module.on('success-without-retry', (circuit: Mollitia.Circuit) => {
    const metricName = getMetricName(circuit);
    success_without_retries.inc(1, metricName);
  });
  module.on('success-with-retry', (circuit: Mollitia.Circuit) => {
    const metricName = getMetricName(circuit);
    success_with_retries.inc(1, metricName);
  });
  module.on('failure-without-retry', (circuit: Mollitia.Circuit) => {
    const metricName = getMetricName(circuit);
    failures_without_retries.inc(1, metricName);
  });
  module.on('failure-with-retry', (circuit: Mollitia.Circuit) => {
    const metricName = getMetricName(circuit);
    failures_with_retries.inc(1, metricName);
  });

  return {
    ...metrics,
    success_without_retries,
    success_with_retries,
    failures_without_retries,
    failures_with_retries
  };
};
