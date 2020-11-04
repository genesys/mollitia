---
title: Mollitia - API - Circuit
---
# Circuit

The `Circuit` is the container of your **Resilience** logic.

## Usage

``` javascript
// Imports the library
const { Circuit } = require('mollitia');
// Creates a circuit
const pgCircuit = new Circuit({
  name: 'PostgreSQL Operations'
});
// Call operations
await circuit.fn(sqlRequest).execute('SELECT * FROM Mollitia;');
```

That is not really useful, as by default, the circuit just calls your method, with your arguments.

## Modules

Adding modules to your circuit will add logic to it, but be careful, **the module ordering have an importance!**
Let's see with an example:

``` javascript
// Imports needed components
const { Circuit, Retry, Timeout } = require('mollitia');
// Creates a Retry Module
const retry = new Retry({
  attempts: 2, // Will retry two times
});
const timeout = new Timeout({
  delay: 500, // Will timeout after 500ms
});
// Creates Circuits
const retryWithTimeout = new Circuit({
  options: {
    modules: [retry, timeout]
  }
});
const timeoutRetries = new Circuit({
  options: {
    modules: [timeout, retry]
  }
});
```

### Retry with Timeout

Here is what will happen with the first circuit:

``` javascript
retryWithTimeout.fn(failureAsync).execute('dummy', 1000) // Launches the failureAsync method, that will return "dummy", and will take 1000ms to complete
// Attempt #1: The function times out (1000 > 500) - Launches First Retry
// Attempt #2: The function times out (1000 > 500) - Launches Second Retry
// Attempt #3: The function times out (1000 > 500) - Fails with TimeoutError
```

### Timeout Retries

Here is what will happen with the second circuit:

``` javascript
timeoutRetries.fn(failureAsync).execute('dummy', 1000) // Exactly like before
// Attempt #1: The function times out (1000 > 500) - Fails with TimeoutError
```

Because the [Timeout](/api/module/timeout) module is set before the [Retry](/api/module/retry) module, the timeout is global for all attempts.
Therefore, the Circuit does have time to make a retry, it times out before.
