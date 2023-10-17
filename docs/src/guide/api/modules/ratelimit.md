<script setup>
	import RatelimitPlayground from '../../../components/playground/modules/ratelimit.vue';
</script>

# Ratelimit

`Ratelimit` module could be used to avoid sending too many requests to the backend during a configurable period of time.

<ClientOnly>
  <RatelimitPlayground/>
</ClientOnly>

## Usage

If you don't want more than 3 requests per second, you should define a circuit like this:

``` typescript
import * as Mollitia from 'mollitia';
const circuit = new Mollitia.Circuit({
  options: {
    modules: [
      new Mollitia.Ratelimit({
        limitPeriod: 1000,
        limitForPeriod: 3
      })
    ]
  }
});
```

If you don't want more than 3 requests per second, and also at least 200ms between each request, you should define a circuit like this:

``` typescript
const ratelimit = new Mollitia.Ratelimit({
  limitPeriod: 1000,
  limitForPeriod: 3
});
const ratelimit2 = new Mollitia.Ratelimit({
  limitPeriod: 200,
  limitForPeriod: 1
});
const circuit = new Mollitia.Circuit({
  options: {
    modules: [
      ratelimit2,
      ratelimit
    ]
  }
});
```

## API Reference

### Options

| Name             | Description                                                        | Default    |
|:-----------------|:-------------------------------------------------------------------|:-----------|
| `limitPeriod`    | Specifies the time period during which the ratelimit is calculated | `0`        |
| `limitForPeriod` | Specifies the maximum number of requests during the period         | `Infinity` |

### Methods

| Name              | Description                              | Returns            |
|:------------------|:-----------------------------------------|:-------------------|
| `getExecParams()` | Returns the circuit function parameters. | `any[]` **params** |

### Events

| Name       | Description                          | Params                                                                       |
|:-----------|:-------------------------------------|:-----------------------------------------------------------------------------|
| `execute`  | Called when the module is executed.  | `Mollitia.Circuit` **circuit**, `Promise<T>` **promise**, `any[]` **params** |
