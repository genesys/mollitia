# Prometheus

The `Mollitia` [Prometheus](https://prometheus.io/) addon adds metrics on every circuit and module so that you can monitor and analyze your applications.

## Quick Start

``` bash
# Install mollitia
npm install mollitia --save
# Install the prometheus addon
npm install @mollitia/prometheus --save
```

``` typescript
// Then add the addon
import * as Mollitia from 'mollitia';
import * as MollitiaPrometheus from '@mollitia/prometheus';

Mollitia.use(new MollitiaPrometheus.PrometheusAddon());
```

Then, add `Prometheus` options when creating circuits or modules:

``` typescript
const myModule = new Mollitia.Timeout({
	prometheus: {
		name: 'my-module'
	}
});
const myCircuit = new Mollitia.Circuit({
  options: {
    prometheus: {
      name: 'my-circuit',
      labels: {
        tag2: 'val2',
        tag3: 'val3'
      }
    }
  }
});

// ...

const myCircuitMetrics = myCircuit.prometheus.metrics; // Will return an object containing all metrics from this circuit
const myCircuitScrap = myCircuit.prometheus.scrap(); // Will return the Prometheus scrap from this circuit
```

Finally, you can get `Prometheus` metrics or scrap like this:

``` typescript
const metrics = MollitiaPrometheus.metrics(); // Will return an object containing all metrics from all circuits and modules
const scrap = MollitiaPrometheus.scrap(); // Will return the Prometheus scrap
```

## API Reference

### Circuit

| Name               | Description                                    | Type      | 
|:-------------------|:-----------------------------------------------|:----------|
| `total_executions` | The amount of times the circuit has been used. | `Counter` |
| `total_success`    | The amount of times the circuit succeeded.     | `Counter` |
| `total_failures`   | The amount of times the circuit failed.        | `Counter` |
| `duration_max`     | The maximum duration of the circuit execution. | `Gauge`   |
| `duration_ave`     | The average duration of the circuit execution. | `Gauge`   |
| `duration_min`     | The minimum duration of the circuit execution. | `Gauge`   |

### Module

| Name               | Description                                    | Type      | 
|:-------------------|:-----------------------------------------------|:----------|
| `total_executions` | The amount of times the module has been used.  | `Counter` |
| `total_success`    | The amount of times the module succeeded.      | `Counter` |
| `total_failures`   | The amount of times the module failed.         | `Counter` |
| `duration_max`     | The maximum duration of the module execution.  | `Gauge`   |
| `duration_ave`     | The average duration of the module execution.  | `Gauge`   |
| `duration_min`     | The minimum duration of the module execution.  | `Gauge`   |

### Timeout

| Name                     | Description                                     | Type      | 
|:-------------------------|:------------------------------------------------|:----------|
| `total_failures_timeout` | The amount of times an execution has timed out. | `Counter` |

### Retry

| Name                       | Description                                             | Type      | 
|:---------------------------|:--------------------------------------------------------|:----------|
| `success_without_retries`  | The amount of executions that succeed without retrying. | `Counter` |
| `success_with_retries`     | The amount of executions that succeed after retrying.   | `Counter` |
| `failures_without_retries` | The amount of executions that failed without retrying.  | `Counter` |
| `failures_with_retries`    | The amount of executions that failed after retrying.    | `Gauge`   |

### Breaker

| Name                     | Description                                     | Type      | 
|:-------------------------|:------------------------------------------------|:----------|
| `breaker_state` | Current State of the Circuit as an enum (Needs to check `state` label). | `Counter` |
| `failure_rate` | The percentage of failure in circuit. | `Counter` |
| `slow_rate` | The percentage of slow requests in circuit. | `Counter` |
