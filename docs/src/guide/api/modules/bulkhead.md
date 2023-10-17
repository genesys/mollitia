<script setup>
	import BulkheadPlayground from '../../../components/playground/modules/bulkhead.vue';
</script>

# Bulkhead

The `Bulkhead` module allows you to **limit** concurrent executions of your circuit.

<ClientOnly>
  <BulkheadPlayground/>
</ClientOnly>

## Usage

``` typescript
import * as Mollitia from 'mollitia';
// Creates a circuit
const circuit = new Mollitia.Circuit({
  options: {
    modules: [
      // Creates a bulkhead module
      new Mollitia.Bulkhead({
        concurrentSize: 2, // Allows 2 concurrent requests, if reached, goes in a queue.
        queueSize: 2, // Allows 2 requests to be in queue, if reached, it will be rejected with a BulkheadOverloadError.
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
    if (err instanceof Mollitia.BulkheadOverloadError) {
      // When the function has been called, the concurrent methods are at maximum, and the queue is full.
    } else if (err instanceof Mollitia.BulkheadQueueWaitError) {
      // The function has been waiting too long in queue (more than 30 seconds).
    }
    // It failed normally (directly, or has been in a queue)
  });
```

## API Reference

### Options

| Name             | Description                                                        | Default |
|:-----------------|:-------------------------------------------------------------------|:--------|
| `concurrentSize` | The number of concurrent requests that can be running in parallel. | `10`    |
| `queueSize`      | The number of requests that can be queued.                         | `10`    |
| `maxQueueWait`   | The amount of time before a queued request is rejected.            | `60000` |

### Methods

| Name              | Description                              | Returns            |
|:------------------|:-----------------------------------------|:-------------------|
| `getExecParams()` | Returns the circuit function parameters. | `any[]` **params** |

### Events

| Name                       | Description                                   | Params                                                                       |
|:---------------------------|:----------------------------------------------|:-----------------------------------------------------------------------------|
| `execute`                  | Called when the module is executed.           | `Mollitia.Circuit` **circuit**, `Promise<T>` **promise**, `any[]` **params** |
| `update-concurrent-buffer` | Called when the concurrent buffer is updated. | `Mollitia.Circuit` **circuit**, `BufferedPromise[]` **buffer**               |
| `update-queue-buffer`      | Called when the queue buffer is updated.      | `Mollitia.Circuit` **circuit**, `BufferedPromise[]` **buffer**               |
