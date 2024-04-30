import * as Mollitia from 'mollitia';
import * as MollitiaRedis from '@mollitia/redis';

Mollitia.use(new MollitiaRedis.RedisAddon({logger: console, host: '127.0.0.1', port: 6379}));

const fakeFunction = ({ data, isSuccess = true, delay }) => {
  return new Promise((resolve, reject) => {
    let msg = `\tExecution ${isSuccess ? 'Success' : 'Failure'} with data ${data}`;
    if (delay) {
      msg += ` after ${delay}ms`;
      setTimeout(() => {
        console.log(msg);
        if (isSuccess) {
          resolve();
        } else {
          reject();
        }
      }, delay);
    } else {
      console.log(msg);
      if (isSuccess) {
        resolve();
      } else {
        reject();
      }
    }
  });
}
const success = async (circuit, ctx) => {
  await circuit.fn(fakeFunction).execute(ctx);
}
const failure = async (circuit, ctx) => {
  try {
    await circuit.fn(fakeFunction).execute({ ...ctx, isSuccess: false });
  } catch {
  }
}
const check = (cond, successMessage, errorMessage) => {
  if (cond) {
    console.log(`\t${successMessage}`);
  } else {
    console.error(`\t${errorMessage}`);
    process.exit(1);
  }
}
const delay = (delay = 1) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
};

const testRateLimitModule = async () => {
  console.log('Testing Rate Limit Module');
  const ratelimitModuleData = {
    name: 'myRateLimitModule',
    limitPeriod: 10000,
    limitForPeriod: 3,
    logger: console
  }
  // 2 Circuits using Redis
  const circuitWithRedis = new Mollitia.Circuit({
    options: {
      modules: [ new Mollitia.Ratelimit({
        ...ratelimitModuleData,
        redis: { use: true }
      })]
    }
  });
  const circuitWithRedis2 = new Mollitia.Circuit({
    options: {
      modules: [ new Mollitia.Ratelimit({
        ...ratelimitModuleData,
        redis: { use: true }
      })]
    }
  });
  // 2 Circuits NOT using Redis
  const circuitNoRedis = new Mollitia.Circuit({
    options: {
      modules: [ new Mollitia.Ratelimit(ratelimitModuleData) ]
    }
  });
  const circuitNoRedis2 = new Mollitia.Circuit({
    options: {
      modules: [ new Mollitia.Ratelimit(ratelimitModuleData) ]
    }
  });

  let nbIterations = 0;
  for (let i = 0; i < 3; i++) {
    await success(circuitNoRedis, { data: `CircuitNoRedis - Iteration ${i}` });
    nbIterations++;
    await success(circuitNoRedis2, { data: `CircuitNoRedis2 - Iteration ${i}` });
    nbIterations++;
  }
  check(
    nbIterations === 6,
    `There should be 6 iterations without redis and result is ${nbIterations} - Working as expected`,
    'There is an issue here with Rate limit without Redis'
  );

  try {
    nbIterations = 0;
    for (let i = 0; i < 3; i++) {
      await success(circuitWithRedis, { data: `CircuitWithRedis - Iteration ${i}` });
      nbIterations++;
      await success(circuitWithRedis2, { data: `CircuitWithRedis2 - Iteration ${i}` });
      nbIterations++;
    }
  } catch (e) {
    if (nbIterations === 3) {
      console.log(`There should be 3 iterations with redis and result is ${nbIterations} - Working as expected`);
    } else {
      console.error('There is an issue here with Rate limit with Redis');
      console.log(e);
      process.exit(1);
    }
  }
  console.log('Testing Rate Limit Module - Result is OK');
}

const testSlidingCountBreakerModule = async () => {
  console.log('Testing Sliding Count Breaker Module');
  const breakerData = {
      failureRateThreshold: 50,
      openStateDelay: 10,
      slidingWindowSize: 5,
      minimumNumberOfCalls: 3,
      redis: {
        use: true
      },
      name: 'mySlidingCountBreaker'
    };
  const slidingCountBreaker = new Mollitia.SlidingCountBreaker(breakerData);
  const slidingCountBreaker2 = new Mollitia.SlidingCountBreaker(breakerData);
  const circuit1 = new Mollitia.Circuit({ options: { modules: [slidingCountBreaker] } });
  const circuit2 = new Mollitia.Circuit({ options: { modules: [slidingCountBreaker2] } });
  await success(circuit1, { data: 'Circuit1' });
  await success(circuit2, { data: 'Circuit2' });
  await failure(circuit1, { data: 'Circuit1' });
  check(slidingCountBreaker.state === Mollitia.BreakerState.CLOSED, 'Ok, circuit is closed', 'Circuit is not closed as expected...');
  await success(circuit1, { data: 'Circuit1' });
  await success(circuit2, { data: 'Circuit2' });
  check(slidingCountBreaker.state === Mollitia.BreakerState.CLOSED, 'Ok, circuit is closed', 'Circuit is not closed as expected...');
  await failure(circuit1, { data: 'Circuit1' });
  check(slidingCountBreaker.state === Mollitia.BreakerState.CLOSED, 'Ok, circuit is closed', 'Circuit is not closed as expected...');
  await failure(circuit2, { data: 'Circuit2' });
  check(slidingCountBreaker2.state === Mollitia.BreakerState.OPENED, 'Ok, circuit is opened', 'Circuit is not opened as expected...');
  console.log('Testing Sliding Count Breaker Module - Result is OK');
}
const testSlidingTimeBreakerModule = async () => {
  console.log('Testing Sliding Time Breaker Module');
  const breakerData = {
    slidingWindowSize: 100,
    minimumNumberOfCalls: 3,
    failureRateThreshold: 70,
    openStateDelay: 2000,
    redis: {
      use: true
    },
    name: 'mySlidingTimeBreaker1'
  };
  const slidingTimeBreaker = new Mollitia.SlidingTimeBreaker(breakerData);
  const slidingTimeBreaker2 = new Mollitia.SlidingTimeBreaker(breakerData);
  const slidingTimeBreaker3 = new Mollitia.SlidingTimeBreaker({ ...breakerData, name: 'mySlidingTimeBreaker2' });
  const circuit1 = new Mollitia.Circuit({ options: { modules: [slidingTimeBreaker] } });
  const circuit2 = new Mollitia.Circuit({ options: { modules: [slidingTimeBreaker2] } });
  const circuit3 = new Mollitia.Circuit({ options: { modules: [slidingTimeBreaker3] } });
  await success(circuit1, { data: 'Circuit1' });
  await failure(circuit2, { data: 'Circuit2' });
  await failure(circuit1, { data: 'Circuit1' });
  check(slidingTimeBreaker.state === Mollitia.BreakerState.CLOSED, 'Ok, circuit is closed', 'Circuit is not closed as expected...');
  await failure(circuit2, { data: 'Circuit2', delay: 150 });
  await failure(circuit1, { data: 'Circuit1' });
  check(slidingTimeBreaker.state === Mollitia.BreakerState.CLOSED, 'Ok, circuit is closed', 'Circuit is not closed as expected...');
  await failure(circuit2, { data: 'Circuit2' });
  check(slidingTimeBreaker2.state === Mollitia.BreakerState.OPENED, 'Ok, circuit is opened', 'Circuit is not opened as expected...');
  try {
    await success(circuit1, { data: 'Circuit1' });
    console.error('This request should not be a success as circuit is opened');
    process.exit(1);
  } catch (e) {
    check(e.message === 'Circuit is opened', 'Ok, Request rejected due to circuit opened', 'Request should have been rejected with opened circuit');
  }
  await failure(circuit3, { data: 'Circuit3' });
  await failure(circuit3, { data: 'Circuit3' });
  check(slidingTimeBreaker2.state === Mollitia.BreakerState.OPENED, 'Ok, circuit is opened', 'Circuit is not opened as expected...');
  check(slidingTimeBreaker3.state === Mollitia.BreakerState.CLOSED, 'Ok, circuit is closed', 'Circuit is not closed as expected...');
  await failure(circuit3, { data: 'Circuit3' });
  check(slidingTimeBreaker3.state === Mollitia.BreakerState.OPENED, 'Ok, circuit is opened', 'Circuit is not opened as expected...');
  console.log('Testing Sliding Time Breaker Module - Result is OK');
}
const testSlidingTimeBreakerModuleSlowRequest = async () => {
  console.log('Testing Sliding Time Breaker Module With Slow Requests');
  const breakerData = {
    failureRateThreshold: 50,
    openStateDelay: 10,
    slidingWindowSize: 1000,
    minimumNumberOfCalls: 2,
    permittedNumberOfCallsInHalfOpenState: 1,
    slowCallDurationThreshold: 100,
    slowCallRateThreshold: 50,
    redis: {
      use: true
    },
    name: 'mySlidingTimeBreakerSlow'
  };
  const slidingTimeBreaker = new Mollitia.SlidingTimeBreaker(breakerData);
  const slidingTimeBreaker2 = new Mollitia.SlidingTimeBreaker(breakerData);
  const circuit1 = new Mollitia.Circuit({ options: { modules: [slidingTimeBreaker] } });
  const circuit2 = new Mollitia.Circuit({ options: { modules: [slidingTimeBreaker2] } });
  await success(circuit1, { data: 'Circuit1', delay: 150 });
  await success(circuit2, { data: 'Circuit2' });
  // Even if 50% of slow requests, circuit is kept closed as last request is success
  check(slidingTimeBreaker2.state === Mollitia.BreakerState.CLOSED, 'Ok, circuit is closed', 'Circuit is not closed as expected...');
  await success(circuit1, { data: 'Circuit1', delay: 150 });
  check(slidingTimeBreaker.state === Mollitia.BreakerState.OPENED, 'Ok, circuit is opened', 'Circuit is not opened as expected...');
  await delay(150);
  check(slidingTimeBreaker.state === Mollitia.BreakerState.HALF_OPENED, 'Ok, circuit is Half Opened', 'Circuit is not Half Opened as expected...');
  await success(circuit2, { data: 'Circuit2', delay: 150 });
  check(slidingTimeBreaker2.state === Mollitia.BreakerState.OPENED, 'Ok, circuit is opened', 'Circuit is not opened as expected...');
  await delay(10);
  await success(circuit1, { data: 'Circuit1' });
  check(slidingTimeBreaker.state === Mollitia.BreakerState.CLOSED, 'Ok, circuit is closed', 'Circuit is not closed as expected...');
  console.log('Testing Sliding Time Breaker Module With Slow Requests - Result is OK');
}

const main = async () => {
  await testRateLimitModule();
  await testSlidingCountBreakerModule();
  await testSlidingTimeBreakerModule();
  await testSlidingTimeBreakerModuleSlowRequest();
  process.exit(0);
}

main();
