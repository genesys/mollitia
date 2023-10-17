import * as Mollitia from 'mollitia';
import { commonMetrics, PrometheusCommonMetrics } from './common.js';
import { PrometheusLabels, PrometheusMetric } from './metrics/index.js';

interface PrometheusCircuitMetrics extends PrometheusCommonMetrics {
  [key: string]: PrometheusMetric;
}

export interface PrometheusCircuitOptions {
  /**
   * The Circuit name (snake_case).
   */
  name: string;
  /**
   * The Prefix for all metrics (snake_case).
   */
  prefix?: string;
  /**
   * Sets if the metrics should be set per function. (default to false)
   */
  perMethod?: boolean;
  /**
   * If perMethod is set to true, set the function name, can be set with fn() function also.
   */
  funcName?: string;
  /**
   * Adds labels to metrics.
   */
  labels?: PrometheusLabels;
}

export interface PrometheusCircuitData extends PrometheusCircuitOptions {
  /**
   * The Circuit metrics.
   */
  metrics: PrometheusCircuitMetrics;
  /**
   * The Circuit Prometheus scrap.
   */
  scrap (): string;
}

export const attachMetrics = (circuit: Mollitia.Circuit, options: Mollitia.CircuitOptions): PrometheusCircuitMetrics => {
  const metrics = commonMetrics(circuit, options);
  return metrics;
};
