import * as Mollitia from 'mollitia';
import { PrometheusModuleOptions } from './index.js';
import { commonMetrics, PrometheusCommonMetrics } from '../common.js';
import { PrometheusMetric } from '../metrics/index.js';

interface PrometheusFallbackMetrics extends PrometheusCommonMetrics {
  [key: string]: PrometheusMetric;
}

export interface PrometheusFallbackData extends PrometheusModuleOptions {
  metrics: PrometheusFallbackMetrics;
  scrap (): string;
}

export const attachMetrics = (module: Mollitia.Module, options: Mollitia.ModuleOptions): PrometheusFallbackMetrics => {
  const metrics = commonMetrics(module, options);
  return metrics;
};
