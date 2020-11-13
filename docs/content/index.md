---
title: Mollitia
description: JavaScript Resilience Library
---

<!-- TODO Badges -->

# Mollitia

`Mollitia` is a **JavaScript Resilience** library that works on Node and on browsers.
The purpose of such kind of tool is to help organize **asynchronous operations** under a highly customizable circuit that helps managing error use cases.
When everything is falling apart, it stops the classic flow and uses modules to manage failures.

## Documentation

<!-- TODO Change -->
[Full documentation website can be find here.](http://135.39.47.16:8080)

## Installation

### With Node or any web UI Framework

``` bash
# Install the dependency
npm install mollitia --save
```

``` javascript
// Javascript
const { Circuit } = require('mollitia');
```

``` typescript
// ES6 or TypeScript
import { Circuit } from 'mollitia';
```

### With CDN

``` html
<!-- CDN -->
<script type="text/javascript" src="https://unpkg.com/mollitia"></script>
<script>
  const { Circuit } = window.Mollitia;
</script>
```

## Usage

``` javascript
// Imports the library
const { Circuit } = require('mollitia');
// Creates a circuit
const myCircuit = new Circuit();
// fn(yourFunction) - execute(yourParams...)
await circuit.fn(yourFunction).execute('dummy');
```

## Features

The point of `Mollitia` is to get every **Resilience patterns** into one library.
It is very similar at what does [Resilience4j](https://github.com/resilience4j/resilience4j) on **Java**, but on **Node**.

<!-- TODO change links -->

- Works on Node and on browser (even **Internet Explorer 11**, wow).
- Implements a wide variety of Resilience patterns, [more on that here.](http://135.39.45.156:8080)
- Has **Method Agnostic** circuits, meaning you don't have to create one circuit per function.
- Supports plugins, [more on that here.](http://135.39.45.156:8080)
