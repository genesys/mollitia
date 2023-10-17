<script setup>
	import RetryPlayground from '../../../components/playground/modules/retry.vue';
</script>

# Retry

The `Retry` module allows you to **retry** a function when it fails.

<ClientOnly>
  <RetryPlayground/>
</ClientOnly>

## Usage

``` typescript
import * as Mollitia from 'mollitia';
// Creates a circuit
const circuit = new Mollitia.Circuit({
  options: {
    modules: [
      // Creates a retry module
      new Mollitia.Retry({
        attempts: 2, // Will retry two times
        interval: 500,
        mode: RetryMode.LINEAR,
        factor: 1 // With interval=500, mode=LINEAR and factor 1, the interval between attempts will grow linearly (500ms before 1st retry, then 1000ms before 2nd retry)
        onRejection: (err, attempt) => { // Can help filtering error and modifying the retry behavior
          // Second parameter represent the current attempt
          // In this example, onRejection will be called 3 times
          // attempt = 0: first failure
          // attempt = 1: first retry failure
          // attempt = 2: second retry failure
          if (err instanceof BrokenError) {
            return false; // Returning false will cancel the retry attempt
          } else if (err instanceof BusyError) {
            return 1000; // Returning a number will modify the interval time, and wait for that time before retry
          } else {
            return true; // Returning true will retry, using the configured interval value
          }
        }
      })
    ]
  }
});
```

## Modes

There is four possible modes could be configured for this extended retry ([CONSTANT](#constant-mode), [LINEAR](#linear-mode), [EXPONENTIAL](#exponential-mode), [JITTER](#jitter-mode))

### CONSTANT mode

This is the default behavior. In this mode, the delay between each retry is always the same: the one configured in the `interval` option.

For example, with interval=100, the retry delay will be 100, 100, 100, ...

### LINEAR mode

In this mode, the delay between each retry grows linearly.

Let's call iteration the number of retry attempts already done. The delay calculation formula is:

``` text
min(interval + (iteration * factor * interval), maxInterval)
```

For example, with factor=3 and interval=100, the retry delay will be 100, 400, 700, 1000, 1300, ...

![Retry - Linear Mode](/img/retry-linear-mode.png)

> As retry delay can grow fast, it's possible to configure maxInterval option to specify the maximum allowed delay.
>
> For example, with factor=3, interval=100, maxInterval=800, the retry delay will be 100, 400, 700, 800, 800, ...  

### EXPONENTIAL mode

In this mode, the delay between each retry grows exponentially.

Let's call iteration the number of retry attempts already done. The delay calculation formula is: (`interval x factor^iteration`)

``` text
min(interval * (factor ** iteration), maxInterval)
```

For example, with factor=2 and interval=100, the retry delay will be 100, 200, 400, 800, 1600, ...

![Retry - Exponential Mode](/img/retry-exponential-mode.png)

> As retry delay can grow fast, it's possible to configure maxInterval option to specify the maximum allowed delay.
>
> For example, with factor=3, interval=100, maxInterval=1000, the retry delay will be 100, 300, 900, 1000, 1000, ...

### JITTER mode

This mode is very close to the exponential mode, the formula is nearly the same.

The retry delay is calculated based on the exponential retry delay, with some delta around it, based on the configuration of the jitterAdjustment

Let's call iteration the number of retry attempts already done. The jitter delay calculation formula is:

(`interval x factor^iteration`) - ((`interval x factor^iteration`) *jitterAdjustment) + (random(0, ((`interval x factor^iteration`)* jitterAdjustment) * 2))

To be more precise, as there is a potential maxInterval duration, the exact calculation is:

``` text
minValue = Math.min((interval x factor^iteration), maxInterval) * ( 1 - jitterAdjustment)
maxValue = Math.min((interval x factor^iteration), maxInterval) * ( 1 + jitterAdjustment)
waitDelay = Math.random(0, (maxValue - minValue)) + minValue
```

#### Example

With

* factor=2
* interval=100
* jitterAdjustment=0.1

The retry delay for 1st retry will be a random value between 90 and 110, for 2nd retry a random value between 180 and 220, a random value between 360 and 440, ...

![Retry - Jitter Mode with 0.1 adjustment](/img/retry-jitter-mode-adjust0.1.png)

![Retry - Jitter Mode with 0.5 adjustment](/img/retry-jitter-mode-adjust0.5.png)

![Retry - Jitter Mode with 1.0 adjustment](/img/retry-jitter-mode-adjust1.0.png)

> As retry delay can grow fast, it's possible to configure maxInterval option to specify the maximum allowed delay used for the random value as maximum boundary.
>
> In this case, the value is calculated between MaxValue - (jitterAdjustment * MaxValue) and MaxValue.
>
> For example, with factor=3,interval=100,maxInterval=1000,jitterAdjustment=0.2, the retry delay will be random(80,120), random(240,360), random(720,1000), random(800,1000), random(800,1000), ...
>
> Note that the 3rd retry random range is between 720 and 1000 because 900 + 0.2*900 (the upper value of the random range) > 1000 (maxInterval)

## API Reference

### Options

| Name               | Description                                                                            | Default                        |
|:-------------------|:---------------------------------------------------------------------------------------|:-------------------------------|
| `attempts`         | The number of retry attempts (the function will be called attempts + 1 times).         | `2`                            |
| `interval`         | The amount of time to wait before retrying.                                            | `0`                            |
| `fastFirst`        | The first retry is done without delay if set to true.                                  | `false`                        |
| `mode`             | The mode for retry                                                                     | `CONSTANT`                     |
| `factor`           | The factor to be used for retry (used only if `mode` is LINEAR, EXPONENTIAL OR JITTER) | LINEAR=`1`, `2` otherwise      |
| `maxInterval`      | The maximum interval between each retry.                                               | `INFINITY`                     |
| `jitterAdjustment` | The percentage to adjust delay randomly based on jitter retry duration                 | `0.1` (clamps from `0` to `1`) |
| `onRejection`      | A filtering callback, to modify the retry behavior.                                    | `none`                         |

### Methods

| Name              | Description                              | Returns            |
|:------------------|:-----------------------------------------|:-------------------|
| `getExecParams()` | Returns the circuit function parameters. | `any[]` **params** |

### Events

| Name                      | Description                                            | Params                                                                       |
|:--------------------------|:-------------------------------------------------------|:-----------------------------------------------------------------------------|
| `execute`                 | Called when the module is executed.                    | `Mollitia.Circuit` **circuit**, `Promise<T>` **promise**, `any[]` **params** |
| `retry`                   | Called when retrying.                                  | `Mollitia.Circuit` **circuit**, `number` **currentAttempt**                  |
| `success-without-retry`   | Called the module execution succeeds without retrying. | `Mollitia.Circuit` **circuit**                                               |
| `success-with-retry`      | Called the module execution succeeds after retrying.   | `Mollitia.Circuit` **circuit**, `number` **attempts**                        |
| `failure-without-retry`   | Called the module execution fails without retrying.    | `Mollitia.Circuit` **circuit**                                               |
| `failure-with-retry`      | Called the module execution fails after retrying.      | `Mollitia.Circuit` **circuit**, `number` **attempts**                        |
| `delay-before-next-retry` | Called when the delay before next retry starts.        | `Mollitia.Circuit` **circuit**, `number` **waitDuration**                    |
