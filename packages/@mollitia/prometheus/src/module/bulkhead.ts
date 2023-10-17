import * as Mollitia from 'mollitia';
import { PrometheusModuleOptions } from './index.js';
import { commonMetrics, PrometheusCommonMetrics } from '../common.js';
import { PrometheusMetric } from '../metrics/index.js';

interface PrometheusBulkheadMetrics extends PrometheusCommonMetrics {
  [key: string]: PrometheusMetric;
}

export interface PrometheusBulkheadData extends PrometheusModuleOptions {
  metrics: PrometheusBulkheadMetrics;
  scrap (): string;
}

export const attachMetrics = (module: Mollitia.Module, options: Mollitia.ModuleOptions): PrometheusBulkheadMetrics => {
  const metrics = commonMetrics(module, options);
  // TODO max_concurrent
  // TODO max_queued
  // TODO total_failures_max_queue_wait
  return metrics;
};
