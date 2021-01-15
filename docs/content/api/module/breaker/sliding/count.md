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

When the circuit is opened, all the requests are failing fast

When the circuit is half opened, a certain number of requests are authorrized. When this number is reached, the failure and slow call rate thresholds are checked to see if the circuit should be opened or closed.

When the circuit is closed, a sliding window is used to store the outcome of calls. 
The count-based sliding window calculates the outcome of the last N calls, and decides if the circuit should be opened (if the failure or slow call rate thresholds are exceeded)
For example, if the count window size is 10, the circular array has always 10 measurements.

<p class="flex-center-row" align="center"><img src="/img/circuit-breaker-diagram.png" alt="Circuit Breaker - Diagram"/></p>

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
