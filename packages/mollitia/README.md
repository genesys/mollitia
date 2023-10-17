# Mollitia

<p align="center"><br/><img width="200" src="https://genesys.github.io/mollitia/favicon.svg" alt="Mollitia Icon"/><br/><br/></p>

> JavaScript Resilience Library

`Mollitia` is a JavaScript Resilience library that works on Node and on browsers.

Its purpose is to help organize **asynchronous operations** under a highly customizable circuit that helps manage error use cases.

When everything is falling apart, it stops the classic flow and uses modules to manage failures.

## 📄 Documentation

Please check out the official documentation to get started using **Mollitia**, visit [genesys.github.io/mollitia](https://genesys.github.io/mollitia).

## ⚙️ Installation

``` bash
npm install --save mollitia
```

## 🚀 Usage

``` typescript
// Imports the library
import * as Mollitia from 'mollitia';
// Creates a circuit
const myCircuit = new Mollitia.Circuit({
	// Initializes a circuit with a handler
	func: yourFunction
});
// This will execute yourFunction('dummy')
await myCircuit.execute('dummy');
```

``` typescript
// Imports the library
import * as Mollitia from 'mollitia';
// Creates a retry module
const myRetryModule = new Mollitia.Retry({
	attempts: 2,
	interval: 500
});
// Creates a circuit
const myCircuit = new Mollitia.Circuit({
	// Initializes a circuit with a handler
	func: yourFunction,
	options: {
		modules: [
			// Adds a retry module to the circuit
			myRetryModule
		]
	}
});
// This will execute yourFunction('dummy'), but if it fails, it will retry two times, once every 500ms
await myCircuit.execute('dummy');
```
