# Mollitia

<p align="center"><br/><img width="200" src="https://genesys.github.io/mollitia/favicon.svg" alt="Mollitia Icon"/><br/><br/></p>

> Mollitia - Prometheus Addon

The `Mollitia` [Prometheus](https://prometheus.io/) addon adds metrics on every circuit and module so that you can monitor and analyze your applications.

## 📄 Documentation

Please check out the official documentation to get started using **Mollitia**, visit [genesys.github.io/mollitia](https://genesys.github.io/mollitia).

## ⚙️ Installation

``` bash
npm install --save @mollitia/prometheus
```

## 🚀 Usage

``` typescript
// Imports the library
import * as Mollitia from 'mollitia';
import { PrometheusAddon } from '@mollitia/prometheus';
// Adds the prometheus addon to Mollitia
Mollitia.use(new PrometheusAddon());
// Creates a circuit
const myCircuit = new Mollitia.Circuit({
	func: yourFunction
});
// This will execute yourFunction('dummy')
await myCircuit.execute('dummy');
// Get metrics and scrap from Prometheus
const metrics = Mollitia.metrics(); // Will return an object containing all metrics from all circuits and modules
const scrap = Mollitia.scrap(); // Will return the Prometheus scrap
```
