---
title: Mollitia - API - Create an addon
---
# Create an addon

Creating an addon is similar as [creating a module](/api/create-module), you should implement the **Mollitia.Addon** interface.

You can then overload some useful methods in order to modify the base `Mollitia` behavior.

The best way to understand what you can do with an addon is to check out existing ones.

Feel free to check out the [Prometheus Addon](https://github.com/genesys/mollitia-prometheus) as learning base.

``` javascript
// Imports the library
const Mollitia = require('mollitia');

// Creates a class
class UselessAddon implements Mollitia.Addon {
  // Called when a circuit is created
  onCircuitCreate (circuit, options) {
    // Feel free to modify the circuit behavior, and add properties to it
  }
  // Called when a module is created
  onModuleCreate (module, options) {
    // Feel free to modify the module behavior, and add properties to it
  }
}

// Usage:
Mollitia.use(new UselessAddon());
```
