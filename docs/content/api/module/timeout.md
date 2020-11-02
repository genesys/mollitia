---
title: Mollitia - API - Module - Timeout
---
# Timeout

<pg-timeout></pg-timeout>

## Usage

The `Timeout` module allows you to **ignore** the result of your async method if it takes too long.

``` javascript
// Imports needed components
const { Circuit, Timeout, TimeoutError } = require('mollitia');
// Creates a circuit
const circuit = new Circuit({
  options: {
    modules: [
      // Creates a timeout module
      new Timeout({
        delay: 120000  // Will get rejected with a TimeoutError if it takes more than 2 minutes
      })
    ]
  }
});

// Let's see what happens if we run a long function
circuit.fn(myLongFunction).execute()
  .then(() => {
    // It took less than 2 minutes, and succeed.
  })
  .catch((err) => {
    if (err instanceof TimeoutError) {
      // It took more than 2 minutes.
    }
    // It took less than 2 minutes, and failed.
  });
```

## Options

| Name     | Description                                          | Default |
|:---------|:------------------------------------------------ ----|:--------|
| `delay`  | The amount of time before a the promise is rejected. | `60000` |

## Events

| Name       | Description                          | Params             |
|:-----------|:-------------------------------------|:-------------------|
| `execute`  | Called when the module is executed.  | `Mollitia.Circuit` |
| `timeout`  | Called when the module is times out. | `Mollitia.Circuit` |
