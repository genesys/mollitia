<script setup>
	import FallbackPlayground from '../../../components/playground/modules/fallback.vue';
</script>

# Fallback

The `Fallback` module allows you to **filter** your errors.

<ClientOnly>
  <FallbackPlayground/>
</ClientOnly>

## Usage

Works very well in conjunction with other modules!
For example, filtering `Circuit Breaker` errors to return a generic error.

``` typescript
import * as Mollitia from 'mollitia';
// Creates a circuit
const circuit = new Mollitia.Circuit({
  options: {
    modules: [
      // Creates a fallback module
      new Mollitia.Fallback({
        callback (err) {
          // Every time the method rejects, You can filter here
          if (err instanceof MyError) {
            // I know this error
            return err; 
          }
          return new UnknownError();
        }
      })
    ]
  }
});

// The rejected errors are filtered, meaning you always know what is returned here
circuit.fn(myFunction).execute()
  .catch((err) => {
    if (err instanceof MyError) {
      // It's a MyError error
    } else {
      // It's an UnknownError error
    }
  });
```

## API Reference

### Options

| Name       | Description                                    | Default           |
|:-----------|:-----------------------------------------------|:------------------|
| `callback` | The callback, called when the circuit rejects. | `Function(Error)` |

### Methods

| Name              | Description                              | Returns            |
|:------------------|:-----------------------------------------|:-------------------|
| `getExecParams()` | Returns the circuit function parameters. | `any[]` **params** |

### Events

| Name       | Description                          | Params                                                                       |
|:-----------|:-------------------------------------|:-----------------------------------------------------------------------------|
| `execute`  | Called when the module is executed.  | `Mollitia.Circuit` **circuit**, `Promise<T>` **promise**, `any[]` **params** |
