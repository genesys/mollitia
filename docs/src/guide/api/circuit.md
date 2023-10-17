# Circuit

The `Circuit` is the container of your **Resilience** logic.

## Usage

``` typescript
// Imports the library
import * as Mollitia from 'mollitia';
// Creates a circuit
const pgCircuit = new Mollitia.Circuit({
  name: 'PostgreSQL Operations',
	func: sqlRequest
});
// Call sqlRequest function
const res = await pgCircuit.execute('SELECT * FROM Mollitia;');
```

> An important thing to remember is that if you attach a function that is attached to an object, you'll have to bind the context, otherwise the `this` reference will be lost.

``` typescript
const serviceController = {
  getUsers: function () {
    return this.request('/get-users');
  },
  request: function (url) {
    // Actual HTTP request call
  }
};
const serviceCircuit = new Mollitia.Circuit({
  name: 'Service - Get Users'
});
// Here, the getUsers function is called normally, but the "this" reference is lost, meaning "this.request" will throw an error
await serviceCircuit.fn(serviceController.getUsers).execute();
// This binding sets the "this" reference to "serviceController", resolving the above issue
await serviceCircuit.fn(serviceController.getUsers.bind(serviceController)).execute();
```

## API Reference

### Constructor

| Name        | Description                                               | Default          |
|:------------|:----------------------------------------------------------|:-----------------|
| `[name]`    | The Circuit name. (For logging purposes)                  | `Circuit{Index}` |
| `[func]`    | The Circuit function. (Can be changed with `fn()` method) | `undefined`      |
| `[options]` | The options, [more on that below.](#options)              | `undefined`      |

#### Options

| Name      | Description                                  | Default |
|:----------|:---------------------------------------------|:--------|
| `modules` | An array of modules, applied to the circuit. | `[]`  |

### Methods

| Name         | Description                          |
|:-------------|:-------------------------------------|
| `execute(...args: any[])`  | Executes the circuit.  |

### Events

| Name       | Description                          | Params                                                                       |
|:-----------|:-------------------------------------|:-----------------------------------------------------------------------------|
| `execute`  | Called when the module is executed.  | `Mollitia.Circuit` **circuit**, `Promise<T>` **promise**, `any[]` **params** |
