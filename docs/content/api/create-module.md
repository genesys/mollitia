---
title: Mollitia - API - Create a module
---
# Create a module

You want to create your own module in order to customize your circuit.

You need to create a new class that extends the base **Mollitia.Module** class and implement the `execute` method.

In the example below, the module just logs a message everytime the circuit is executed.
You can use it as a template for your own module.

``` javascript
// Imports the library
const { Circuit, Module } = require('mollitia');

// Creates a class
class UselessModule extends Module {
  // Should implement the constructor, and call super(options)
  constructor (options) {
    super(options);
    this.message = options.message;
  }
  // Should implement the execute method
  async execute (circuit, promise, ...params) {
    // circuit: Circuit being executed
    // promise: The Circuit Function being used
    // params[]: The list of parameters that needs to be passed to the promise
    // Uncomment the line below to get the parameters that have been passed to the execute() function
    // const _params = this.getExecParams(circuit, params);
    console.info(`${circuit.name} - ${this.message}`); // That's some useful stuff
    return promise(...params); // This just executes normally the method
  }
}

// Let's use our new module
const circuit = new Circuit({
  name: 'UselessCircuit',
  options: {
    modules: [
      new UselessModule({
        message: 'Hello World!'
      })
    ]
  }
});

// Execute the circuit
circuit.fn(() => { return; }).execute();

// Logs will be:
// UselessCircuit - Hello World!
```
