---
title: Mollitia - API - Module - Cache
---
# Cache

<pg-cache></pg-cache>

## Usage

The `Cache` module allows you to **cache** your results for a configurable amount of time.
Once you call a **function**, with some **parameters**, it will check if it has been cached, if so, the function will not be called at all, and will directly resolve with the cached response.

> It is important to understand that the cache works by reference!<br/>
> That means that the cache is specificly referenced **for one function**, and **for the same parameters**.<br/>

``` javascript
// Imports needed components
const { Circuit, Cache } = require('mollitia');
// Creates a circuit
const circuit = new Circuit({
  options: {
    modules: [
      // Creates a cache module
      new Cache({
        ttl: 60000  // A cached response will be kept for 1 minute
      })
    ]
  }
});

// If the result is a success, it will be cached.
await circuit.fn(myFirstFunction).execute();
// ...
// If this function is called before 1 minute is ellapsed, the cached response will be returned
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
await circuit.fn(myFirstFunction).execute(myObject);
```

## Options

| Name   | Description                                           | Default    |
|:-------|:------------------------------------------------------|:-----------|
| `ttl`  | The amount of time before a cached result is cleared. | `Infinity` |

## Events

| Name       | Description                         | Params             |
|:-----------|:------------------------------------|:-------------------|
| `execute`  | Called when the module is executed. | `Mollitia.Circuit` |
