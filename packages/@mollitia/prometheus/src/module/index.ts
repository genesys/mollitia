import { PrometheusLabels, PrometheusMetrics } from '../metrics/index.js';

export interface PrometheusModuleOptions {
  /**
   * The Module name (snake_case).
   */
  name: string;
  /**
   * The Prefix for all metrics (snake_case).
   */
  prefix?: string;
  /**
   * Adds labels to metrics.
   */
  labels?: PrometheusLabels;
}

export interface PrometheusModuleData extends PrometheusModuleOptions {
  metrics: PrometheusMetrics;
  scrap (): string;
}
