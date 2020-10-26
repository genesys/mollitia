---
title: Mollitia
description: TODO
---

# Mollitia

> JavaScript Resilience Library

<!-- TODO Description -->

## Documentation

<!-- TODO Change -->
[Full documentation website can be find here.](http://135.39.45.156:8080)

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

<!-- TODO change -->
``` javascript
const myCircuit = new Circuit({
  name: 'dummy',
  options: {
    // Customize the circuit here
  }
});
// First param is your async function
// Other params will directly be passed to this function
myCircuit.execute(anyAsyncFunction, param1, param2, ...);
```

## Features

<!-- TODO update -->

<div>

  - Works on Node and on browser (even **IE11**, wow).
  - Can add `timeout` to your async methods.
  - Customize your circuit with [a wide variety of options](/api/options).

</div>

<!-- TODO comparison with resilience4j -->
