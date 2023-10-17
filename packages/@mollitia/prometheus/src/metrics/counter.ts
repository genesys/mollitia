import { PrometheusLabels, PrometheusMetric, PrometheusMetricLabelValues, PrometheusMetricType } from './index.js';

interface PrometheusCounterOptions {
  description: string;
  labels?: PrometheusLabels;
}

export class PrometheusCounter implements PrometheusMetric {
  // Public Attributes
  public key: string;
  public type: PrometheusMetricType;
  public labels: PrometheusLabels;
  public values: PrometheusMetricLabelValues;
  public description?: string;
  // Private attributes
  // Constructor
  constructor (key: string, options?: PrometheusCounterOptions) {
    this.key = key;
    this.type = PrometheusMetricType.COUNTER;
    this.labels = options?.labels || {};
    this.values = {};
    if (options?.description) { this.description = options?.description; }
  }
  // Public Methods
  public inc (value = 1, circuitName: string): number {
    this.values[circuitName] = this.values[circuitName] || 0;
    this.values[circuitName] += value;
    return this.values[circuitName];
  }
  public scrap (): string {
    let str = '';
    if (Object.keys(this.values).length) {
      str = this.scrapHelp();
      str += this.scrapValues();
    }
    return str;
  }
  public scrapHelp (): string {
    let str = `# HELP ${this.key} ${this.description}\n`;
    str += `# TYPE ${this.key} ${this.type}\n`;
    return str;
  }
  public scrapValues (): string {
    let res = '';
    if (Object.keys(this.values).length) {
      for (const circuit in this.values) {
        let labels = `circuit="${circuit}"`;
        for (const label in this.labels) {
          labels+= `, ${label}="${this.labels[label]}"`;
        }
        res += `${this.key}{${labels}} ${this.values[circuit]}\n`;
      }
    }
    return res;
  }
}
