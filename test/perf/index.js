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
  console.log('With Circuit Breaker | Without Circuit Breaker | Circuit Breaker latency');
  let promises = [];
  for (let i=0; i<nbCycles; i++) {
    promises.push(spawnClient());
  }
  await Promise.all(promises);
}

main();
