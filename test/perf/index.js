const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

const circuitConfig = yaml.parse(fs.readFileSync(path.join(__dirname, 'config.yaml'), 'utf8'));

function spawnClient() {
  return new Promise((resolve, reject) => {
    const cp = spawn('node', [path.join(__dirname, 'runtime.js'), JSON.stringify(circuitConfig)]);
    cp.stdout.on('data', data => {
      process.stdout.write(`${data}`);
    });
    cp.on('close', _ => {
      resolve();
    });
    cp.on('error', _ => {
      reject();
    });
  });
}

async function main() {
  const nbCycles = circuitConfig.config?.nbCycles || 5;
  const nbOperations = circuitConfig.config?.nbCalls || 100;
  const callDuration = circuitConfig.config?.duration || 10;
  for (let i=0; i<nbCycles; i++) {
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
  }
  circuit.dispose();
  console.log('With Circuit Breaker | Without Circuit Breaker | Circuit Breaker latency');
  for (let i=0; i<nbCycles; i++) {
    promises.push(spawnClient());
  }
  await Promise.all(promises);
}

main();
