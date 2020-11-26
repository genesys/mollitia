---
title: Mollitia - API - Module - Ratelimit
---
# Ratelimit

<pg-ratelimit></pg-ratelimit>

## Usage

Ratelimit is used to avoid sending too many requests to the backend during a configurable period of time.

If you don't want more than 3 requests per second, you should define a circuit like this:

``` javascript
const ratelimit = new Mollitia.Ratelimit({
  limitPeriod: 1000,
  limitForPeriod: 3,
  logger
});
const circuit = new Mollitia.Circuit({
  options: {
    modules: [
      ratelimit
    ]
  }
});
```

If you don't want more than 3 requests per second, and also at least 200ms between each request, you should define a circuit like this:

``` javascript
const ratelimit = new Mollitia.Ratelimit({
  limitPeriod: 1000,
  limitForPeriod: 3,
  logger
});
const ratelimit2 = new Mollitia.Ratelimit({
  limitPeriod: 200,
  limitForPeriod: 1,
  logger
});
const circuit = new Mollitia.Circuit({
  options: {
    modules: [
      ratelimit2,
      ratelimit
    ]
  }
});
```

## Options

| Name | Description                                    | Default           |
|:-----|:-----------------------------------------------|:------------------|
| limitPeriod        | Specifies the time period during which the ratelimit is calculated | `0` |
| limitForPeriod     | Specifies the maximum number of requests during the period | `Infinity` |

## Events

| Name       | Description                          | Params                         |
|:-----------|:-------------------------------------|:--------------- ---------------|
| `execute`  | Called when the module is executed.  | `Mollitia.Circuit` **circuit** |
