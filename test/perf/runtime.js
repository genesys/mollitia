const Mollitia = require('../../dist/mollitia.umd');

const modules = [];
const args = process.argv.slice(2);
const circuitConfig = JSON.parse(args[0]);
circuitConfig.modules.forEach(mod => {
  (mod.options || {}).logger = console;
  switch (mod.type) {
    case 'SlidingTimeBreaker':
      modules.push(new Mollitia.SlidingTimeBreaker(mod.options));
      break;
    case 'SlidingCountBreaker':
      modules.push(new Mollitia.SlidingCountBreaker(mod.options));
      break;
    case 'RateLimit':
      modules.push(new Mollitia.RateLimit(mod.options));
      break;
    case 'Retry':
      modules.push(new Mollitia.Retry(mod.options));
      break;
    case 'Timeout':
      modules.push(new Mollitia.Timeout(mod.options));
      break;
    case 'Cache':
      modules.push(new Mollitia.Cache(mod.options));
      break;
    case 'Bulkhead':
      modules.push(new Mollitia.Bulkhead(mod.options));
      break;
  }
});

const circuit = new Mollitia.Circuit({
  options: {
    modules
  }
});

const successAsync = (delay = 1) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
}

const calculationDuration = (prefix, durations) => {
  //console.log(durations);
  const l = (durations.reduce((acc,curr) => acc += curr, 0) / durations.length).toFixed(2);
  //console.log(`${prefix} - Duration: ${l}`);
  return l;
}

async function main() {
  let durations = [];
  let resultsNoCircuitBreaker = [];
  let resultsCircuitBreaker = [];
  //const nbCycles = circuitConfig.config?.nbCycles || 5;
  const nbOperations = circuitConfig.config?.nbCalls || 100;
  const callDuration = circuitConfig.config?.duration || 10;
  //for (let i=0; i<nbCycles; i++) {
    for (let k=0;k<nbOperations;k++) {
      const time1 = new Date().getTime();
      try {
        await successAsync(callDuration);
      } catch (err) {
        console.log("Error");
      }
      const timeForOper = new Date().getTime() - time1;
      durations.push(timeForOper);
    }
    resultsNoCircuitBreaker.push(calculationDuration('No Circuit Breaker',durations));
  
    durations = [];
    for (let k=0;k<nbOperations;k++) {
      const time1 = new Date().getTime();
      try {
        await circuit.fn(successAsync).execute(callDuration);
      } catch (err) {
        console.log("Error");
      }
      const timeForOper = new Date().getTime() - time1;
      durations.push(timeForOper);
    }
    resultsCircuitBreaker.push(calculationDuration('With Circuit Breaker',durations));
  //}
  circuit.end();
  for (var i=0; i<resultsCircuitBreaker.length; i++) {
    const l = resultsNoCircuitBreaker[i].length;
    const l1 = resultsCircuitBreaker[i].length;
    console.log(` ${resultsNoCircuitBreaker[i]}${' '.repeat(20 - l)}| ${resultsCircuitBreaker[i]}${' '.repeat(24 - l1)}| ${(resultsCircuitBreaker[i] - resultsNoCircuitBreaker[i]).toFixed(2)}`);
  }
}

main();