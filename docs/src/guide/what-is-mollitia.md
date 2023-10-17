# What is Mollitia?

`Mollitia` is a JavaScript Resilience library that works on Node and on browsers.

Its purpose is to help organize **asynchronous operations** under a highly customizable circuit that helps manage error use cases.

When everything is falling apart, it stops the classic flow and uses modules to manage failures.

## Features

The point of `Mollitia` is to get every **Resilience pattern** into one library.

It is very similar to the [Resilience4j](https://github.com/resilience4j/resilience4j) **Java** library, but on **Node**.

- Works on Node and on browser (even **Internet Explorer 11**, wow 🙀).
- Implements a wide variety of Resilience patterns.
- Has **Method Agnostic** circuits, meaning you don't have to create one circuit per function.
- Supports addons.
