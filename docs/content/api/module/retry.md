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
        onRejection: (err) => { // Can help filtering error and modifying the retry behavior
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

| Name       | Description                          | Params                                                      |
|:-----------|:-------------------------------------|:------------------------------------------------------------|
| `execute`  | Called when the module is executed.  | `Mollitia.Circuit` **circuit**                              |
| `retry`    | Called when retrying.                | `Mollitia.Circuit` **circuit**, `number` **currentAttempt** |
