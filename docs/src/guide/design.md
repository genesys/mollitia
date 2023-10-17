# Design

Using `Mollitia` is easy as creating some **Circuits** that contains **Modules** that easily adds `Resilience` capabilities to your asynchronous operations.

`Mollitia` is heavily inspired by [Resilience4j](https://github.com/resilience4j/resilience4j) and [Polly](https://github.com/App-vNext/Polly).

It provides a collection of `Modules` that can be attached to a [Circuit](./api/circuit).

You can then execute a asynchronous operation on the circuit, and the attached modules will be triggered when needed.

``` mermaid
stateDiagram
  A: circuit.execute()
	B: Circuit
	C: Module 1
	D: Module 2
	E: Module N
	F: Async Function
	G: response
	direction LR
	[*] --> A
	A --> B
	state B {
		direction LR
		C --> D
		D --> E
		E --> F
	}
	B --> G
```

Adding modules to your circuit will add logic to it, but be careful, **the module ordering have an importance!**
Let's see with an example:

``` typescript
import * as Mollitia from 'mollitia';
// Creates a Retry Module
const retry = new Mollitia.Retry({
  attempts: 2, // Will retry two times
});
const timeout = new Mollitia.Timeout({
  delay: 500, // Will timeout after 500ms
});
// Creates Circuits
const retryWithTimeout = new Mollitia.Circuit({
  options: {
    modules: [retry, timeout]
  }
});
const timeoutRetries = new Mollitia.Circuit({
  options: {
    modules: [timeout, retry]
  }
});
```

### Retry with Timeout

Here is what will happen with the first circuit:

``` typescript
retryWithTimeout.fn(failureAsync).execute('dummy', 1000) // Launches the failureAsync method, that will return "dummy", and will take 1000ms to complete
// Attempt #1: The function times out (1000 > 500) - Launches First Retry
// Attempt #2: The function times out (1000 > 500) - Launches Second Retry
// Attempt #3: The function times out (1000 > 500) - Fails with TimeoutError
```

### Timeout Retries

Here is what will happen with the second circuit:

``` typescript
timeoutRetries.fn(failureAsync).execute('dummy', 1000) // Exactly like before
// Attempt #1: The function times out (1000 > 500) - Fails with TimeoutError
```

Because the [Timeout](./api/modules/timeout) module is set before the [Retry](./api/modules/retry) module, the timeout is global for all attempts.

Therefore, the Circuit does have time to make a retry, it times out before.
