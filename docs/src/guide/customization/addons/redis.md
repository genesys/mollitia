# Redis

The `Mollitia` [Redis](https://redis.io/) addon adds redis for some modules of every circuit. The list of modules coming with redis support are Ratelimit, SlidingCountBreaker and SlidingTimeBreaker.

## Quick Start

``` bash
# Install mollitia
npm install mollitia --save
# Install Redis and the Redis addon
npm install @mollitia/redis redis --save
```

``` typescript
// Then add the addon
import * as Mollitia from 'mollitia';
import { RedisAddon } from '@mollitia/redis';
// Adds the Redis addon to Mollitia
Mollitia.use(
  new RedisAddon({ 
    host: <Redis hostName>, 
    port: <Redis Port>,
    password: <Redis Password> 
  })
);
```

Then, add `redis` options when creating modules. Redis is only available for Ratelimit, SlidingCountBreaker or SlidingTimeBreaker module.

``` typescript
const rateLimitModule = new Mollitia.Ratelimit({
  name: 'myRateLimitModule',
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
      rateLimit: rateLimitModule
    ]
  }
});
// This will execute yourFunction('dummy')
await myCircuit.execute('dummy');

```

## API Reference

### Options

#### When Addon is created

| Name             | Description                                                                 | Default    |
|:-----------------|:----------------------------------------------------------------------------|:-----------|
| `getMaxDelay`    | Specifies the maximum time, in milliseconds,to get data from Redis          | `500`      |
| `setMaxDelay`    | Specifies the maximum time, in milliseconds,to set data to Redis            | `500`      |
| `ttl`            | Specifies the maximum duration, in milliseconds, the data stays in  Redis   | `0`        |

#### At module level

| Name             | Description                                                                 | Default    |
|:-----------------|:----------------------------------------------------------------------------|:-----------|
| `use`            | Specifies if the redis is used for the module                               | `false`    |
| `getMaxDelay`    | Specifies the maximum time, in milliseconds,to get data from Redis          | `500`      |
| `setMaxDelay`    | Specifies the maximum time, in milliseconds,to set data to Redis            | `500`      |
| `ttl`            | Specifies the maximum duration, in milliseconds, the data stays in  Redis   | `0`        |

#### Option priority

When an option is defined both at Addon level and at module level, the option value is taken from module

Example:
``` typescript
Mollitia.use(new RedisAddon({ host: <Redis hostName>, port: <Redis Port>, password: <Redis Password>, getMaxDelay: 1000, setMaxDelay: 1000 }));
const rateLimitModule = new Mollitia.Ratelimit({
  name: 'myRateLimitModule',
  limitForPeriod: 2,
  limitPeriod: 20000,
  redis: {
    use: true,
    getMaxDelay: 500
  }
};
````
With such configuration, getMaxDelay is 500, setMaxDelay is 1000 and ttl is 0 (not set, so using default value)


#### Additional information related to the options

* getMaxDelay and setMaxDelay

These options are available to avoid blocking the operations for a long time when Redis is slow or unavailable.

* ttl

This option could be used to avoid keeping some keys in Redis for a long duration. Setting ttl to 0 deactivate the ttl.

Please note that this option is only applicable when Redis is used with SlidingCountBreaker module, as SlidingTimeBreaker module and Ratelimit module come with existing ttl (slidingWindowSize for SlidingCountBreaker, limitPeriod for Ratelimit).

This option is converted to a number of seconds, and rounded to the next integer.
