---
title: Mollitia - API - Circuit
---
# Circuit

The `Circuit` is the container of your **Resilience** logic.

<p class="flex-center-row" align="center"><img src="/img/circuit-architecture.png" alt="Circuit - Architecture"/></p>

## Usage

``` typescript
// Imports the library
const { Circuit } = require('mollitia');
// Creates a circuit
const pgCircuit = new Circuit({
  name: 'PostgreSQL Operations'
});
// Call operations (here, sqlRequest is an async function)
const myString = await pgCircuit.fn(sqlRequest).execute('SELECT * FROM Mollitia;');
// With TypeScript, you can set the return result of the circuit (here it's a string)
const myString = await pgCircuit.fn(sqlRequest).execute<string>('SELECT * FROM Mollitia;');
```

### Function binding

An important thing to remember is that if you attach a function that is attached to a javascript object, you'll have to bind the context, otherwise the `this` reference will be lost.

``` javascript
const serviceController = {
  getUsers: function () {
    return this.request('/get-users');
  },
  request: function (url) {
    // Actual HTTP request call
  }
};
const serviceCircuit = new Circuit({
  name: 'Service - Get Users'
});
// Here, the getUsers function is called normally, but the "this" reference is lost, meaning "this.request" will throw an error
await serviceCircuit.fn(serviceController.getUsers).execute();
// This binding sets the "this" reference to "serviceController", resolving the above issue
await serviceCircuit.fn(serviceController.getUsers.bind(serviceController)).execute();
```

## Modules

Adding modules to your circuit will add logic to it, but be careful, **the module ordering have an importance!**
Let's see with an example:

``` javascript
// Imports needed components
const { Circuit, Retry, Timeout } = require('mollitia');
// Creates a Retry Module
const retry = new Retry({
  attempts: 2, // Will retry two times
});
const timeout = new Timeout({
  delay: 500, // Will timeout after 500ms
});
// Creates Circuits
const retryWithTimeout = new Circuit({
  options: {
    modules: [retry, timeout]
  }
});
const timeoutRetries = new Circuit({
  options: {
    modules: [timeout, retry]
  }
});
```

### Retry with Timeout

Here is what will happen with the first circuit:

``` javascript
retryWithTimeout.fn(failureAsync).execute('dummy', 1000) // Launches the failureAsync method, that will return "dummy", and will take 1000ms to complete
// Attempt #1: The function times out (1000 > 500) - Launches First Retry
// Attempt #2: The function times out (1000 > 500) - Launches Second Retry
// Attempt #3: The function times out (1000 > 500) - Fails with TimeoutError
```

### Timeout Retries

Here is what will happen with the second circuit:

``` javascript
timeoutRetries.fn(failureAsync).execute('dummy', 1000) // Exactly like before
// Attempt #1: The function times out (1000 > 500) - Fails with TimeoutError
```

Because the [Timeout](/api/module/timeout) module is set before the [Retry](/api/module/retry) module, the timeout is global for all attempts.
Therefore, the Circuit does have time to make a retry, it times out before.

## Factory

| Name      | Description                                               | Default          |
|:----------|:----------------------------------------------------------|:-----------------|
| `name`    | The Circuit name. (For logging purposes)                  | `Circuit{Index}` |
| `func`    | The Circuit function. (Can be changed with `fn()` method) | `none`           |
| `options` | The options, [more on that below.](#options).             | `none`           |

## Options

| Name      | Description                                  | Default |
|:----------|:---------------------------------------------|:--------|
| `modules` | An array of modules, applied to the circuit. | `none`  |

## Events

| Name       | Description                          | Params                                                   |
|:-----------|:-------------------------------------|:---------------------------------------------------------|
| `execute`  | Called when the module is executed.  | `Mollitia.Circuit` **circuit**, `Promise<T>` **promise** |
