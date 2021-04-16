---
title: Mollitia - API - Module - Sliding Count Breaker
---
# Sliding Count Breaker

<pg-count></pg-count>

## Usage

The Circuit Breaker has 3 possible states:
* CLOSED
* OPEN 
* HALF_OPEN

When the circuit is opened, all the iterations are failing fast

When the circuit is half opened, a certain number of iterations are authorrized. When this number is reached, the failure and slow call rate thresholds are checked to see if the circuit should be opened or closed.

When the circuit is closed, a sliding window is used to store the outcome of calls. 
The count-based sliding window calculates the outcome of the last N calls, and decides if the circuit should be opened (if the failure or slow call rate thresholds are exceeded)
For example, if the count window size is 10, the circular array has always 10 measurements.

``` javascript
// Imports needed components
const { Circuit, SlidingCountBreaker } = require('mollitia');
// Creates Sliding Count Breaker Module
const slidingCountBreaker = new SlidingCountBreaker({
  name: 'my-sliding-count-breaker',
  slidingWindowSize: 6, // Failure Rate Calculation is done on the last 6 iterations
  minimumNumberOfCalls: 3, // 3 iterations are needed to start calculating the failure rate, and see if circuit should be opened or not
  failureRateThreshold: 50, // If half of the iterations or more are failing, the circuit is switched to Opened state.
  slowCallDurationThreshold: 1000, // An iteration is considered as being slow if the iteration lasts more than 1s
  slowCallRateThreshold: 80, // If at least 80% of the iterations are considered as being slow, the circuit is switched to Opened state.
  permittedNumberOfCallsInHalfOpenState: 2, // When the circuit is in Half Opened state, the circuit accepts 2 iterations in this state.
  // Once these 2 iterations are received, failure rate is calculated on these iterations.
  // If failure rate is lower than failureRateThreshold, the circuit is switched to Closed state.
  // If the failure rate is higher or equal to failureRateThreshold, the circuit is switched to Opened state.
  openStateDelay: 10000 // The circuit stays in Opened state for 10s
});
// Creates a circuit
const circuit = new Circuit({
  name: 'my-circuit',
  options: {
    modules: [ slidingCountBreaker ]
  }
});

await circuit.fn(myFunction).execute();
await circuit.fn(myFunction2).execute();
// When this 3rd iteration is received, failureRate and slowCallRate is calculated
// If the 3 iterations lasts less than 1s and are all success, then the circuit is still closed
// The circuit is opened if:
//   - at least 2 iterations failed (failure rate is 66% (2 iterations failing) or 100% (3 iterations failing), which is > 50 (failureRateThreshold))
//   - or all the iterations are slow (as slowCallRateThreshold is 80%)
await circuit.fn(myFunction3).execute();
// If
//   - circuit is still closed, then the failure rate and slow call rate threshold will be calculated when a new iteration is received
//   - circuit is opened, then the iterations are failing fast
// Here, 4th iteration received. Calculation will be done on the 4th iterations
await circuit.fn(myFunction4).execute();
// Here, 5th iteration received. Calculation will be done on the 4 iterations
await circuit.fn(myFunction5).execute();
// Here, 6th iteration received. Calculation will be done on the 6 iterations
await circuit.fn(myFunction6).execute();
// Here, number of iterations is 7. So, the 1st iteration is no longer taken into account and the calculation is done on iterations 2 to 7 
await circuit.fn(myFunction7).execute();
```

<p class="flex-center-row" align="center"><pg-img src="/img/circuit-breaker-diagram.png" alt="Circuit Breaker - Diagram"></pg-img></p>

## Options

| Name             | Description                                                        | Default |
|:-----------------|:-------------------------------------------------------------------|:--------|
| state | Specifies the circuit state | `CLOSED` |
| failureRateThreshold | Specifies the failure rate threshold in percentage                     | `50`             |
| slowCallRateThreshold | Specifies the slow call rate threshold. A call is considered as slow when the call duration is greater than slowCallDurationThreshold | `100` |
| slowCallDurationThreshold | Specifies the duration (in ms) threshold above which calls are considered as slow | `60000 (ms)` |
| permittedNumberOfCallsInHalfOpenState | Specifies the number of permitted calls when the circuit is half open | `2` |
| halfOpenStateMaxDelay | Specifies the maximum wait (in ms) in Half Open State, before switching back to open. 0 deactivates this | `0` |
| slidingWindowSize | Specifies the maximum number of calls used to calculate failure and slow call rate percentages | `10` |
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
