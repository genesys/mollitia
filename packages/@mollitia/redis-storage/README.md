# Mollitia

<p align="center"><br/><img width="200" src="https://genesys.github.io/mollitia/favicon.svg" alt="Mollitia Icon"/><br/><br/></p>

> Mollitia - Redis Storage Addon

The `Mollitia` [Redis Storage](https://redis.io/) addon adds redis storage for some modules of every circuit. The list of modules coming with redis support are RateLimit, SlidingCountBreaker and SlidingTimeBreaker.

## 📄 Documentation

Please check out the official documentation to get started using **Mollitia**, visit [genesys.github.io/mollitia](https://genesys.github.io/mollitia).

## ⚙️ Installation

``` bash
npm install --save @mollitia/redis-storage
```

## 🚀 Usage

``` typescript
// Imports the library
import * as Mollitia from 'mollitia';
import { StorageAddon } from '@mollitia/redis-storage';
// Adds the Redis Storage addon to Mollitia
Mollitia.use(new StorageAddOn({ host: <Redis hostName>, port: <Redis Port>, password: <Redis Password> }));
// Creates the module that will be used in your circuit, using Redis Storage
// Redis Storage is only applicable for Modules:
//  - RateLimit
//  - SlidingCountBreaker
//  - SlidingTimeBreaker
const rateLimit = new Mollitia.Ratelimit({
  name: 'myRateLimit',
  limitForPeriod: 2,
  limitPeriod: 20000,
  storage: {
    // Setting storage.use to true indicates Redis Storage should be used
    use: true
  }
};
// Creates a circuit
const myCircuit = new Mollitia.Circuit({
  // Initializes a circuit with a handler
  func: yourFunction,
  options: { 
    modules: [ 
      rateLimit 
    ]
  }
});
// This will execute yourFunction('dummy')
await myCircuit.execute('dummy');

```
