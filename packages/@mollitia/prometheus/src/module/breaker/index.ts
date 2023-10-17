import * as Mollitia from 'mollitia';
import { PrometheusModuleOptions } from '../index.js';
import { commonMetrics, PrometheusCommonMetrics } from '../../common.js';
import { PrometheusMetric } from '../../metrics/index.js';

interface PrometheusBreakerMetrics extends PrometheusCommonMetrics {
  [key: string]: PrometheusMetric;
}

export interface PrometheusBreakerData extends PrometheusModuleOptions {
  metrics: PrometheusBreakerMetrics;
  scrap (): string;
}

export const attachMetrics = (module: Mollitia.Module, options: Mollitia.ModuleOptions): PrometheusBreakerMetrics => {
  const metrics = commonMetrics(module, options);
  // TODO breaker_state
  // TODO failure_rate
  // TODO failure_slow_rate
  // TODO total_failures_open
  // TODO total_failures_slow
  return metrics;
};
