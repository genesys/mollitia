<script setup>
	import CachePlayground from '../../../components/playground/modules/cache.vue';
</script>

# Cache

The `Cache` module allows you to **cache** your results for a configurable amount of time.

<ClientOnly>
  <CachePlayground/>
</ClientOnly>

## Usage

Once you call a **function**, with some **parameters**, it will check if it has been cached, if so, the function will not be called at all, and will directly resolve with the cached response.

> It is important to understand that the cache works by reference!<br/>
> That means that the cache is specifically referenced **for one function**, and **for the same parameters**.<br/>

Also, when a circuit fails and have an outdated cached response (ttl has been passed), the circuit will fire the request, and will respond with the new value if it succeeds, otherwise it will resolve with the cached response.

``` typescript
import * as Mollitia from 'mollitia';
// Creates a circuit
const circuit = new Mollitia.Circuit({
  options: {
    modules: [
      // Creates a cache module
      new Mollitia.Cache({
        ttl: 60000,  // A cached response will be considered as valid for 1 minute
        cacheClearInterval: 900000 // A cached response will be kept for 15 minutes
      })
    ]
  }
});

// If the result is a success, it will be cached.
await circuit.fn(myFirstFunction).execute();
// ...
// If this function is called before 1 minute is elapsed, the cached response will be returned
await circuit.fn(myFirstFunction).execute();
// This is a simple object
const myObject = {
  myFirstParam: 'myFirstValue'
};
// Same as before, if that's a success, the result is cached. (The params are different, so it does not return the cache from before)
await circuit.fn(myFirstFunction).execute(myObject);
// The objects changes
myObject.myFirstParam = 'myFirstValuesModified';
// Nevermind, the cache works by reference, meaning the cached result is returned.
await circuit.fn(myFirstFunction).execute(myObject);
// That won't return the cached result, as the function is different
await circuit.fn(mySecondFunction).execute(myObject);
// ... After 1 minute, the function is called again.
circuit.fn(myFirstFunction).execute(myObject)
  .then(() => {
    // If the request succeeds, it returns the result normally
    // If not, the old cached response is returned
  });
// After 15 minutes, the cache is cleared.
```

## API Reference

### Options

| Name                      | Description                                                                                    | Default  |
|:--------------------------|:-----------------------------------------------------------------------------------------------|:---------|
| `ttl`                     | The amount of time during which a cached result is considered valid.                           | `6000`   |
| `cacheClearInterval`      | The amount of time before the cache cleans itself up.                                          | `900000` |
| `getInformationFromCache` | Specifies if the async response is retrieved from Cache (`res._mollitiaIsFromCache` is `true`) | `false`  |
| `adjustCacheParams`       | A filtering callback, to modify the parameters used for Cache Key.                             | `none`   |

### Methods

| Name              | Description                              | Returns            |
|:------------------|:-----------------------------------------|:-------------------|
| `getExecParams()` | Returns the circuit function parameters. | `any[]` **params** |

### Events

| Name            | Description                                                     | Params                                                                       |
|:----------------|:----------------------------------------------------------------|:-----------------------------------------------------------------------------|
| `execute`       | Called when the module is executed.                             | `Mollitia.Circuit` **circuit**, `Promise<T>` **promise**, `any[]` **params** |
| `cache-hit`     | Called when the module returns a cached result.                 | `Mollitia.Circuit` **circuit**, `any[]` **cacheKeys**                        |
| `cache-hit-old` | Called when the module returns an old cached result on failure. | `Mollitia.Circuit` **circuit**, `any[]` **cacheKeys**                        |
