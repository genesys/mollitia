---
title: Mollitia
description: JavaScript Resilience Library
---

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=genesys_mollitia&metric=alert_status)](https://sonarcloud.io/dashboard?id=genesys_mollitia)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=genesys_mollitia&metric=coverage)](https://sonarcloud.io/dashboard?id=genesys_mollitia)
[![Version](https://img.shields.io/npm/v/mollitia)](https://www.npmjs.com/package/mollitia)
[![Downloads](https://img.shields.io/npm/dt/mollitia)](https://www.npmjs.com/package/mollitia)
[![License](https://img.shields.io/npm/l/mollitia)](https://github.com/cadgerfeast/mollitia/blob/master/LICENSE)

<p align="center"><br/><img width="200" src="https://genesys.github.io/mollitia/icon.svg" alt="Mollitia Icon"/><br/><br/></p>

`Mollitia` is a **JavaScript Resilience** library that works on Node and on browsers.
The purpose of such kind of tool is to help organize **asynchronous operations** under a highly customizable circuit that helps managing error use cases.
When everything is falling apart, it stops the classic flow and uses modules to manage failures.

## Documentation

[Full documentation website can be found here.](https://genesys.github.io/mollitia/)

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

- Works on Node and on browser (even **Internet Explorer 11**, wow).
- Implements a wide variety of Resilience patterns.
- Has **Method Agnostic** circuits, meaning you don't have to create one circuit per function.
- Supports addons.

## Comparison with other libraries

- [cockatiel](https://github.com/connor4312/cockatiel)
  - Misses the **Cache** and **Ratelimit** modules.
  - Cannot create **module** or **addons**.
- [opossum](https://github.com/nodeshift/opossum)
  - **Only support the Circuit Breaker module**
  - Cannot have **Method Agnostic** circuits.
  - Cannot create **module** or **addons**.
- [brakes](https://github.com/awolden/brakes)
  - **Only support the Circuit Breaker module**
  - Cannot have **Method Agnostic** circuits.
  - Cannot create **module** or **addons**.

## License

- **[MIT license](http://opensource.org/licenses/mit-license.php)**
- Copyright 2023 © [Genesys](https://www.genesys.com/).
