# Mollitia

<p align="center"><br/><img width="200" src="https://genesys.github.io/mollitia/favicon.svg" alt="Mollitia Icon"/><br/><br/></p>

> Mollitia - Redis Addon

The `Mollitia` [Redis](https://redis.io/) addon adds redis for some modules of every circuit. The list of modules coming with redis support are Ratelimit, SlidingCountBreaker and SlidingTimeBreaker.

## 📄 Documentation

Please check out the official documentation to get started using **Mollitia**, visit [genesys.github.io/mollitia](https://genesys.github.io/mollitia).

## ⚙️ Installation

``` bash
npm install --save @mollitia/redis
```

## 🚀 Usage

``` typescript
// Imports the library
import * as Mollitia from 'mollitia';
import { RedisAddOn } from '@mollitia/redis';
// Adds the Redis addon to Mollitia
Mollitia.use(new RedisAddOn({
  host: <Redis hostName>,
  port: <Redis Port>,
  password: <Redis Password>
}));
// Creates the module that will be used in your circuit, using Redis
// Redis is only applicable for Modules:
//  - Ratelimit
//  - SlidingCountBreaker
//  - SlidingTimeBreaker
const rateLimit = new Mollitia.Ratelimit({
  name: 'myRateLimit',
  limitForPeriod: 2,
  limitPeriod: 20000,
  redis: {
    // Setting redis.use to true indicates Redis should be used
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
