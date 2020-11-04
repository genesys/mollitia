---
title: Mollitia - API - Create a module
---
# Create a module

Creating a new module is easy, you can extends the base **Module** class and use it like so:

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
    // params[]: The list of parameters being used
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
