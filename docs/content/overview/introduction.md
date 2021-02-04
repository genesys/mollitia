---
title: Mollitia - Overview - Introduction
---
# Introduction

`Mollitia` is heavily inspired by [Resilience4j](https://github.com/resilience4j/resilience4j) and [Polly](https://github.com/App-vNext/Polly).

It provides a collection of `Modules` that can be attached to a [Circuit](/api/circuit).
You can then execute a asynchronous operation on the circuit, and the attached modules will be triggered when needed.

## Cool Features

* It works on browsers, what about you add it to your frontend so that you avoid bursting your service?
* It works on NodeJS, what about you add it to your service so that you avoid bursting external services?
* A Circuit **Method Agnostic**, meaning it is not stucked with one method, and you can change at will.
* Modules provides a wide range of events to help monitoring and analyzing.
* Modules can be shared by multiple circuits.
<!-- TODO add playground examples, accessible with /api/playground#example-1 -->
<!-- * The order of modules have importance, and you can do cool stuff with it, [more on that in the Playground examples.](/api/playground). -->

## Modules

`Modules` can be attached to your circuit, you should take a look at [the circuit documentation](/api/circuit) before looking at them.

You can modify your circuit behavior by adding `modules`, some basic resiliency patterns are already available directly in the library, find the list *just below*.

If your application need a more specific behavior, you can create your own module, [folowing this documentation](/api/create-module).

## Core Modules

* **[Fallback](/api/module/fallback)**: Allows filtering and planning when errors are happening.
* **[Cache](/api/module/cache)**: Cache a response, and provide fast for time, and performance optimization.
* **[Retry](/api/module/retry)**: When something fails, it'll work next time.
* **[Timeout](/api/module/timeout)**: If it takes too long, it maybe be already broken.
* **[Ratelimit](/api/module/ratelimit)**: Do not burst requests, limit yourself.
* **[Bulkhead](/api/module/bulkhead)**: Allows of certain amount of concurrent requests, and a queue for others.
* **[Sliding Count Circuit Breaker](/api/module/breaker/sliding/count)**: Breaks when errors happens, with a circular array memory.
* **[Sliding Time Circuit Breaker](/api/module/breaker/sliding/time)**: Breaks when errors happens, with a circular array memory, in a range of time.

## Addons

`Addons` can modify or add features of `Mollitia`, for example, it can be useful to create an addon in order to modify the behavior of all modules.

If you want to create your own, [find out how here](/api/create-addon).

A list of official `addons` can be found *just below*.

### Core Addons
<!-- TODO add prometheus link -->
<!-- * **[Prometheus](http://135.39.45.156:8081)**: Adds multiple metrics to your modules and circuits. -->
