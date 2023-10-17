import * as Mollitia from 'mollitia';
import { PrometheusModuleOptions } from './index.js';
import { commonMetrics, PrometheusCommonMetrics } from '../common.js';
import { PrometheusMetric } from '../metrics/index.js';

interface PrometheusCacheMetrics extends PrometheusCommonMetrics {
  [key: string]: PrometheusMetric;
}

export interface PrometheusCacheData extends PrometheusModuleOptions {
  metrics: PrometheusCacheMetrics;
  scrap (): string;
}

export const attachMetrics = (module: Mollitia.Module, options: Mollitia.ModuleOptions): PrometheusCacheMetrics => {
  const metrics = commonMetrics(module, options);
  // TODO total_cache_hit
  // TODO total_cache_hit_old
  return metrics;
};
