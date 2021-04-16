---
title: Mollitia - API - Module - Sliding Time Breaker
---
# Sliding Time Breaker

<pg-time></pg-time>

## Usage

The Circuit Breaker has 3 possible states:
* CLOSED
* OPEN 
* HALF_OPEN

When the circuit is opened, all the iterations are failing fast

When the circuit is half opened, a certain number of iterations are authorized. When this number is reached, the failure and slow call rate thresholds are checked to see if the circuit should be opened or closed.

When the circuit is closed, a sliding window is used to store the outcome of calls. 
The time-based sliding window calculates the outcome of the last calls received during the last N milliseconds, and decides if the circuit should be opened (if the failure or slow call rate thresholds are exceeded)
For example, if the count window size is 10000, the circular array stores the iterations that occurred during the last 10s (with a maximum of 1000 elements in the array)

``` javascript
// Imports needed components
const { Circuit, SlidingTimeBreaker } = require('mollitia');
// Creates Sliding Count Breaker Module
const slidingTimeBreaker = new SlidingTimeBreaker({
  name: 'my-sliding-time-breaker',
  slidingWindowSize: 30000, // Failure Rate Calculation is done on the iterations received during the last 30s.
  minimumNumberOfCalls: 2, // 2 iterations are needed to start calculating the failure rate, and see if circuit should be opened or not
  failureRateThreshold: 60, // If at least 60% of the iterations are failing, the circuit is switched to Opened state.
  slowCallDurationThreshold: 500, // An iteration is considered as being slow if the iteration lasts more than 0.5s
  slowCallRateThreshold: 40, // If at least 40% of the iterations are considered as being slow, the circuit is switched to Opened state.
  permittedNumberOfCallsInHalfOpenState: 2, // When the circuit is in Half Opened state, the circuit accepts 2 iterations in this state.
  // Once these 2 iterations are received, failure rate is calculated on these iterations.
  // If failure rate is lower than failureRateThreshold, the circuit is switched to Closed.
  // If the failure rate is higher or equal to failureRateThreshold, the circuit is switched to Opened.
  openStateDelay: 10000 // The circuit stays in Opened state for 10s
});
// Creates a circuit
const circuit = new Circuit({
  name: 'my-circuit',
  options: {
    modules: [ slidingCountBreaker ]
  }
});
// Time is t0
await circuit.fn(myFunction).execute();
// 10s later (t0 + 10s)
// When this 2nd iteration is received, failureRate and slowCallRate is calculated
// If the 2 iterations lasts less than 500ms and are all success, then the circuit is still closed
// The circuit is opened if:
//   - the 2 iterations failed (as failureRateThreshold is 60%)
//   - at least 1 iteration is slow (as slowCallRateThreshold is 40%)
await circuit.fn(myFunction2).execute();
// 10s later (t0 + 20s)
// Elapsed time since 1st iteration is lower than 30s
// If circuit is still closed, the failureRate and slowCallRate threshold is calculated on the 3 iterations 
await circuit.fn(myFunction3).execute();
// 5s later (t0 + 25s)
// Elapsed time since 1st iteration is lower than 30s
// If circuit is still closed, the failureRate and slowCallRate threshold is calculated on the 4 iterations
await circuit.fn(myFunction4).execute();
// 10s later (t0 + 35s)
// Elapsed time since 1st iteration is greater than 30s. Elapsed time since 2nd iteration is lower than 30s
// If circuit is still closed, the failureRate and slowCallRate threshold is now calculated on iterations from 2 to 5, as iteration 1 is too old
await circuit.fn(myFunction5).execute();

```

<p class="flex-center-row" align="center"><pg-img src="/img/circuit-breaker-diagram.png" alt="Circuit Breaker - Diagram"></pg-img></p>

## Options

| Name             | Description                                                        | Default |
|:-----------------|:-------------------------------------------------------------------|:--------|
| state | Specifies the circuit state | `CLOSED` |
| failureRateThreshold        | Specifies the failure rate threshold in percentage                     | `50`             |
| slowCallRateThreshold | Specifies the slow call rate threshold. A call is considered as slow when the call duration is greater than slowCallDurationThreshold | `100` |
| slowCallDurationThreshold | Specifies the duration (in ms) threshold above which calls are considered as slow | `60000 (ms)` |
| permittedNumberOfCallsInHalfOpenState | Specifies the number of permitted calls when the circuit is half open | `2` |
| halfOpenStateMaxDelay | Specifies the maximum wait (in ms) in Half Open State, before switching back to open. 0 deactivates this | `0` |
| slidingWindowSize | Specifies the sliding duration (in ms)  used to calculate failure and slow call rate percentages | `10` |
| minimumNumberOfCalls | Specifies the minimum number of calls used to calculate failure and slow call rate percentages | `10` |
| openStateDelay | Specifies the time (in ms) the circuit stay opened before switching to half-open | `60000` |
| onError | Allows filtering of the error to report as a failure or not. | `None` |

## Events

| Name       | Description                          | Params                         |
|:-----------|:-------------------------------------|:-------------------------------|
| `execute`  | Called when the module is executed.  | `Mollitia.Circuit` **circuit** |
| `state-changed`  | Called when the breaker state changes.  | `Mollitia.BreakerState` **state** |

## Methods

| Name       | Description                          | Returns                         |
|:-----------|:-------------------------------------|:-------------------------------|
| `getExecParams`  | Returns the circuit function parameters.  | `any[]` **params** |
