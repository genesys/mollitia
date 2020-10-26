---
title: Mollitia - API - Module - Rate Limit
---
# Rate Limit

<pg-ratelimit></pg-ratelimit>

## Usage

Rate Limit is used to avoid sending too many requests to the backend during a configurable period of time.

### Example

If you don't want more than 3 requests per second, you should define a circuit like this:

``` javascript
const rateLimit = new Mollitia.RateLimit({
  limitPeriod: 1000,
  limitForPeriod: 3,
  logger
});
const circuit = new Mollitia.Circuit({
  options: {
    modules: [
      rateLimit
    ]
  }
});
```

If you don't want more than 3 requests per second, and also at least 200ms between each request, you should define a circuit like this:

``` javascript
const rateLimit = new Mollitia.RateLimit({
  limitPeriod: 1000,
  limitForPeriod: 3,
  logger
});
const rateLimit2 = new Mollitia.RateLimit({
  limitPeriod: 200,
  limitForPeriod: 1,
  logger
});
const circuit = new Mollitia.Circuit({
  options: {
    modules: [
      rateLimit2,
      rateLimit
    ]
  }
});
```

### Configuration

| Name               | Type                          | Description                                                                             | Default         |
|:-------------------|:------------------------------|:----------------------------------------------------------------------------------------|:----------------|
| limitPeriod        | `number`                      | Specifies the time period during which the rate limit is calculated                     | `0`             |
| limitForPeriod     | `number`                      | Specifies the maximum number of requests during the period                              | `Infinity`      |
