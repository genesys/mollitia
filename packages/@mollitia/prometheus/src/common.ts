import * as Mollitia from 'mollitia';
import { PrometheusMetric } from './metrics/index.js';
import { PrometheusCounter } from './metrics/counter.js';
import { PrometheusGauge } from './metrics/gauge.js';

type durationType = {
  [key: string]: number;
};

export interface PrometheusCommonMetrics {
  [key: string]: PrometheusMetric;
  /**
   * The total count of executions.
   */
  total_executions: PrometheusCounter;
  /**
   * The total count of success.
   */
  total_success: PrometheusCounter;
  /**
   * The total count of failures.
   */
  total_failures: PrometheusCounter;
  /**
   * The maximum duration of execution.
   */
  duration_max: PrometheusGauge;
  /**
   * The average duration of execution.
   */
  duration_ave: PrometheusGauge;
  /**
   * The minimum duration of execution.
   */
  duration_min: PrometheusGauge;
  /**
   * The number of execution used for the duration.
   */
  duration_count: PrometheusGauge;
}

export const getMetricName = (executor: Mollitia.Circuit|Mollitia.Module) => {
  if (executor.constructor.name === Mollitia.Circuit.name) {
    const circuit = executor as Mollitia.Circuit;
    return circuit.prometheus.perMethod ? `${circuit.prometheus.name}_${circuit.prometheus.funcName}` : executor.prometheus.name;
  } else {
    return executor.prometheus.name;
  }
};

export const commonMetrics = (executor: Mollitia.Circuit|Mollitia.Module, options: Mollitia.CircuitOptions|Mollitia.ModuleOptions): PrometheusCommonMetrics => {
  let labels = options.prometheus?.labels;
  if (executor.constructor.name !== Mollitia.Circuit.name) {
    labels = { ...labels, module: options.prometheus?.name || '' };
  }
  // Total Executions
  const total_executions = new PrometheusCounter(
    `${options.prometheus?.prefix ? `${options.prometheus?.prefix}_` : ''}total_executions`,
    {
      description: 'Total Executions',
      labels
    }
  );
  // Total Success
  const total_success = new PrometheusCounter(
    `${options.prometheus?.prefix ? `${options.prometheus?.prefix}_` : ''}total_success`,
    {
      description: 'Total Success',
      labels
    }
  );
  const total_failures = new PrometheusCounter(
    `${options.prometheus?.prefix ? `${options.prometheus?.prefix}_` : ''}total_failures`,
    {
      description: 'Total Failures',
      labels
    }
  );
  // Duration
  const totalDuration: durationType = {};
  const duration_max = new PrometheusGauge(
    `${options.prometheus?.prefix ? `${options.prometheus?.prefix}_` : ''}duration`,
    {
      description: 'Maximum Duration of Circuit Execution',
      labels: { ...labels, metricType: "MAX" }
    }
  );
  const duration_ave = new PrometheusGauge(
    `${options.prometheus?.prefix ? `${options.prometheus?.prefix}_` : ''}duration`,
    {
      description: 'Average Duration of Circuit Execution',
      labels: { ...labels, metricType: "AVG" }
    }
  );
  const duration_min = new PrometheusGauge(
    `${options.prometheus?.prefix ? `${options.prometheus?.prefix}_` : ''}duration`,
    {
      description: 'Minimum Duration of Circuit Execution',
      labels: { ...labels, metricType: "MIN" }
    }
  );
  const duration_count = new PrometheusGauge(
    `${options.prometheus?.prefix ? `${options.prometheus?.prefix}_` : ''}duration`,
    {
      description: 'Count of Circuit Execution',
      labels: { ...labels, metricType: "COUNT" }
    }
  );

  // Handlers
  executor.on('execute', (executor: Mollitia.Circuit|Mollitia.Module, promise: Promise<any>) => {
    const metricName = getMetricName(executor);
    totalDuration[metricName] = totalDuration[metricName] || 0;

    const start = Date.now();
    total_executions.inc(1, metricName);
    promise
      .then(() => {
        const durationCount = duration_count.inc(1, metricName);
        if (durationCount === 1) {
          totalDuration[metricName] = 0;
        }
        const duration = Date.now() - start;
        totalDuration[metricName] += duration;
        const min = duration_min.get(metricName);
        if (!min || (min > duration)) {
          duration_min.set(duration, metricName);
        }
        const max = duration_max.get(metricName);
        if (!max || (max < duration)) {
          duration_max.set(duration, metricName);
        }
        duration_ave.set(totalDuration[metricName] / durationCount, metricName);
      })
      .catch(() => {
        total_failures.inc(1, metricName);
      });
  });
  return {
    total_executions,
    total_success,
    total_failures,
    duration_max,
    duration_ave,
    duration_min,
    duration_count
  };
};
