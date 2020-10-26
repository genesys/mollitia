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

When the circuit is opened, all the requests are failing fast

When the circuit is half opened, a certain number of requests are authorrized. When this number is reached, the failure and slow call rate thresholds are checked to see if the circuit should be opened or closed.

When the circuit is closed, a sliding window is used to store the outcome of calls. 
The time-based sliding window calculates the outcome of the last calls receiving during the last N milliseconds, and decides if the circuit should be opened (if the failure or slow call rate thresholds are exceeded)
For example, if the count window size is 10000, the circular array stores the requests that occurred during the last 10s (with a maximum of 1000 elements in the array)

### Configuration

Here are the properties that you could set for your sliding time circuit breaker:

| Name                 | Type                          | Description                                                                             | Default         |
|:---------------------|:------------------------------|:----------------------------------------------------------------------------------------|:----------------|
| failureRateThreshold        | `number`                      | Specifies the failure rate threshold in percentage                     | `50`             |
| slowCallRateThreshold     | `number`                      | Specifies the slow call rate threshold. A call is considered as slow when the call duration is greater thaan slowCallDurationThreshold                              | `100`      |
| slowCallDurationThreshold | `number` | Specifies the duration (in ms) threshold above which calls are considered as slow | `60000 (ms)` |
| permittedNumberOfCallsInHalfOpenState | `number` | Specifies the number of permitted calls when the circuit is half open | `2` |
| halfOpenStateMaxDelay | `number` | Specifies the maximum wait (in ms) in Half Open State, before switching back to open. 0 deactivates this | `0` |
| slidingWindowSize | `number` | Specifies the maximum number of calls used to calculate failure and slow call rate percentages | `60000 (ms)` |
| minimumNumberOfCalls | `number` | Specifies the minimum number of calls rrequused to calculate failure and slow call rate percentages | `10` |
| openStateDelay | `number` | Specifies the time (in ms) the circuit stay opened before switching to half-open | `60000 (ms)` |