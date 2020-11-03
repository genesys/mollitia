---
title: Mollitia - API - Module - Fallback
---
# Fallback

## Usage

The `Fallback` module allows you to **filter** your errors.

Works very well in conjunction with other modules!
For example, filtering `Circuit Breaker` errors to return a generic error.

``` javascript
// Imports needed components
const { Circuit, Fallback } = require('mollitia');
// Creates a circuit
const circuit = new Circuit({
  options: {
    modules: [
      // Creates a fallback module
      new Fallback({
        cb (err) {
          // Every time the method rejects, You can filter here
          if (err instanceof MyError) {
            // I know this error
            return err; 
          }
          return new UnknownError();
        }
      })
    ]
  }
});

// The rejected errors are filtered, meaning you always know what is returned here
circuit.fn(myFunction).execute()
  .catch((err) => {
    if (err instanceof MyError) {
      // It's a MyError error
    } else {
      // It's an UnknownError error
    }
  });
```

## Options

| Name | Description                                    | Default           |
|:-----|:-----------------------------------------------|:------------------|
| `cb` | The callback, called when the circuit rejects. | `Function(Error)` |

## Events

| Name       | Description                         | Params             |
|:-----------|:------------------------------------|:-------------------|
| `execute`  | Called when the module is executed. | `Mollitia.Circuit` |
