---
title: Mollitia - API - Module - Retry
---
# Retry

<pg-retry></pg-retry>

## Usage

The `Retry` module allows you to **retry** a function when it fails.
You can configure the interval between attempts, and filter the error to see if you want to retry or not.

``` javascript
// Imports needed components
const { Circuit, Retry } = require('mollitia');
// Creates a circuit
const circuit = new Circuit({
  options: {
    modules: [
      // Creates a bulkhead module
      new Retry({
        attempts: 2, // Will retry two times
        interval: 500, // Will wait 500ms between attempts
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

## Options

| Name          | Description                                                                    | Default |
|:--------------|:-------------------------------------------------------------------------------|:--------|
| `attempts`    | The number of retry attempts (the function will be called attempts + 1 times). | `2`     |
| `interval`    | The amount of time to wait before retrying.                                    | `0`     |
| `onRejection` | A filtering callback, to modify the retry behavior.                            | `none`  |

## Events

| Name                    | Description                                            | Params                                                      |
|:------------------------|:-------------------------------------------------------|:------------------------------------------------------------|
| `execute`               | Called when the module is executed.                    | `Mollitia.Circuit` **circuit**                              |
| `retry`                 | Called when retrying.                                  | `Mollitia.Circuit` **circuit**, `number` **currentAttempt** |
| `success-without-retry` | Called the module execution succeeds without retrying. | `Mollitia.Circuit` **circuit**                              |
| `success-with-retry`    | Called the module execution succeeds after retrying.   | `Mollitia.Circuit` **circuit**, `number` **attempts**       |
| `failure-without-retry` | Called the module execution fails without retrying.    | `Mollitia.Circuit` **circuit**                              |
| `failure-with-retry`    | Called the module execution fails after retrying.      | `Mollitia.Circuit` **circuit**, `number` **attempts**       |

## Methods

| Name             | Description                              | Returns                       |
|:-----------------|:-----------------------------------------|:------------------------------|
| `getExecParams`  | Returns the circuit function parameters. | `any[]` **params**            |
