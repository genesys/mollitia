---
title: Mollitia - API - Create a plugin
---
# Create a plugin

Creating a plugin is similar as [creating a module](/api/create-module), you should implement the **Plugin** interface:

``` javascript
// Imports the library
const Mollitia = require('mollitia');

// Creates a class
class UselessPlugin implements Mollitia.Plugin {
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
