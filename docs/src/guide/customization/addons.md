# Addons

`Addons` can modify or add features of `Mollitia`, for example, it can be useful to create an addon in order to modify the behavior of all modules.

If you want to create your own, [more on that just below.](#create-an-addon)

## Create an Addon

Creating an addon is similar as [creating a module](./modules), you should implement the **Mollitia.Addon** interface.

You can then overload some useful methods in order to modify the base `Mollitia` behavior.

The best way to understand what you can do with an addon is to check out existing ones.

Feel free to check out the [Prometheus Addon](./addons/prometheus) as learning base.

``` typescript
import * as Mollitia from 'mollitia';
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
