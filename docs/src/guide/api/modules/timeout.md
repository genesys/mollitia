<script setup>
	import TimeoutPlayground from '../../../components/playground/modules/timeout.vue';
</script>

# Timeout

The `Timeout` module allows you to **ignore** the result of your async method if it takes too long.

<ClientOnly>
  <TimeoutPlayground/>
</ClientOnly>

## Usage

``` typescript
import * as Mollitia from 'mollitia';
// Creates a circuit
const circuit = new Mollitia.Circuit({
  options: {
    modules: [
      // Creates a timeout module
      new Mollitia.Timeout({
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
    if (err instanceof Mollitia.TimeoutError) {
      // It took more than 2 minutes.
    }
    // It took less than 2 minutes, and failed.
  });
```

## API Reference

### Options

| Name     | Description                                          | Default |
|:---------|:-----------------------------------------------------|:--------|
| `delay`  | The amount of time before a the promise is rejected. | `60000` |

### Methods

| Name              | Description                              | Returns            |
|:------------------|:-----------------------------------------|:-------------------|
| `getExecParams()` | Returns the circuit function parameters. | `any[]` **params** |

### Events

| Name       | Description                          | Params                                                                       |
|:-----------|:-------------------------------------|:-----------------------------------------------------------------------------|
| `execute`  | Called when the module is executed.  | `Mollitia.Circuit` **circuit**, `Promise<T>` **promise**, `any[]` **params** |
| `timeout`  | Called when the module times out.    | `Mollitia.Circuit` **circuit**                                               |
