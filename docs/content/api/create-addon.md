---
title: Mollitia - API - Create an addon
---
# Create an addon

Creating an addon is similar as [creating a module](/api/create-module), you should implement the **Addon** interface:

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
```
