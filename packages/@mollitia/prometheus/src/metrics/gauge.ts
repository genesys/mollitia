import { PrometheusLabels, PrometheusMetric, PrometheusMetricLabelValues, PrometheusMetricType } from './index.js';

interface PrometheusGaugeOptions {
  description: string;
  labels?: PrometheusLabels;
}

export class PrometheusGauge implements PrometheusMetric {
  // Public Attributes
  public key: string;
  public type: PrometheusMetricType;
  public labels: PrometheusLabels;
  public values: PrometheusMetricLabelValues;
  public description?: string;
  // Private attributes
  // Constructor
  constructor (key: string, options?: PrometheusGaugeOptions) {
    this.key = key;
    this.type = PrometheusMetricType.GAUGE;
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
  public get (circuitName: string): number {
    return this.values[circuitName];
  }
  public set (value: number, circuitName: string): number {
    this.values[circuitName] = value;
    return this.values[circuitName];
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
        const valWithMax2Digits = this.values[circuit] % 1 ? this.values[circuit].toFixed(2) : this.values[circuit];
        res += `${this.key}{${labels}} ${valWithMax2Digits}\n`;
      }
    }
    this.values = {};
    return res;
  }
}
