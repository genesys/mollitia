---
title: Mollitia - API - Module - Bulkhead
---
# Bulkhead

<pg-bulkhead></pg-bulkhead>

## Usage

The `Bulkhead` module allows you to **limit** concurrent executions of your circuit.

``` javascript
// Imports needed components
const { Circuit, Bulkhead, BulkheadOverloadError, BulkheadQueueWaitError } = require('mollitia');
// Creates a circuit
const circuit = new Circuit({
  options: {
    modules: [
      // Creates a bulkhead module
      new Bulkhead({
        concurrentSize: 2, // Allows 2 concurrent requests, if oversizing, goes in a queue.
        queueSize: 2, // Allows 2 requests to be in queue, if oversizing, it will be rejected with a BulkheadOverloadError.
        maxQueueWait: 30000 // After 30 seconds waiting, a queued request will be rejected with a BulkheadQueueWaitError.
      })
    ]
  }
});

// Let's say this function is running multiple times in a relatively short amount of time
circuit.fn(myFunction).execute()
  .then(() => {
    // The succeed normally (directly, or has been in a queue)
  })
  .catch((err) => {
    if (err instanceof BulkheadOverloadError) {
      // When the function has been called, the concurrent methods are at maximum, and the queue is full.
    } else if (err instanceof BulkheadQueueWaitError) {
      // The function has been waiting too long in queue (more than 30 seconds).
    }
    // It failed normally (directly, or has been in a queue)
  });
```

## Options

| Name             | Description                                                        | Default |
|:-----------------|:-------------------------------------------------------------------|:--------|
| `concurrentSize` | The number of concurrent requests that can be running in parallel. | `10`    |
| `queueSize`      | The number of requests that can be queued.                         | `10`    |
| `maxQueueWait`   | The amount of time before a queued request is rejected.            | `60000` |

## Events

| Name       | Description                          | Params             |
|:-----------|:-------------------------------------|:-------------------|
| `execute`  | Called when the module is executed.  | `Mollitia.Circuit` |
