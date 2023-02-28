import { delay } from '../../../src/helpers/time';
import * as Mollitia from '../../../src/index';

const successAsync = jest.fn().mockImplementation((res: unknown = 'default', delay = 1) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(res);
    }, delay);
  });
});

const failureAsync = jest.fn().mockImplementation((res: unknown = 'default', delay = 1) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(res);
    }, delay);
  });
});

describe('Retry', () => {
  afterEach(() => {
    successAsync.mockClear();
    failureAsync.mockClear();
  });
  it('check default value', async () => {
    const retry = new Mollitia.Retry();
    expect(retry.attempts).toBe(2);
    expect(retry.interval).toBe(0);
    expect(retry.mode).toBe(Mollitia.RetryMode.CONSTANT);
    expect(retry.attempts).toBe(2);
    expect(retry.maxInterval).toBe(Infinity);
    expect(retry.fastFirst).toBe(false);
    expect(retry.jitterAdjustment).toBe(0.1);
    const retryLinear = new Mollitia.Retry({
      attempts: 3,
      mode: Mollitia.RetryMode.LINEAR,
      fastFirst: true,
      jitterAdjustment: 12
    });
    expect(retryLinear.mode).toBe(Mollitia.RetryMode.LINEAR);
    expect(retryLinear.attempts).toBe(3);
    expect(retryLinear.maxInterval).toBe(Infinity);
    expect(retryLinear.fastFirst).toBe(true);
    expect(retryLinear.factor).toBe(1);
    expect(retryLinear.jitterAdjustment).toBe(0.1);
    const retryExponential = new Mollitia.Retry({
      attempts: 2,
      mode: Mollitia.RetryMode.EXPONENTIAL,
      maxInterval: 1223,
      jitterAdjustment: -0.1
    });
    expect(retryExponential.mode).toBe(Mollitia.RetryMode.EXPONENTIAL);
    expect(retryExponential.attempts).toBe(2);
    expect(retryExponential.maxInterval).toBe(1223);
    expect(retryExponential.fastFirst).toBe(false);
    expect(retryExponential.factor).toBe(2);
    expect(retryExponential.jitterAdjustment).toBe(0.1);
    const retryJitter = new Mollitia.Retry({
      attempts: 3,
      mode: Mollitia.RetryMode.JITTER,
      jitterAdjustment: 0.3
    });
    expect(retryJitter.mode).toBe(Mollitia.RetryMode.JITTER);
    expect(retryJitter.attempts).toBe(3);
    expect(retryJitter.maxInterval).toBe(Infinity);
    expect(retryJitter.fastFirst).toBe(false);
    expect(retryJitter.factor).toBe(2);
    expect(retryJitter.jitterAdjustment).toBe(0.3);
    const retryJitter2 = new Mollitia.Retry({
      attempts: 3,
      mode: Mollitia.RetryMode.JITTER,
      factor: 4
    });
    expect(retryJitter2.factor).toBe(4);
  });
  it('should retry the function multiple times - Basic Test', async () => {
    const retry = new Mollitia.Retry({
      attempts: 2
    });
    const onRetry = jest.fn();
    retry.on('retry', onRetry);
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [
          retry
        ]
      }
    });
    await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('dummy');
    expect(onRetry).toHaveBeenNthCalledWith(1, circuit, 1);
    expect(onRetry).toHaveBeenNthCalledWith(2, circuit, 2);
  });
  it('should retry function and use the timeout', async () => {
    const onEvent = jest.fn();
    const retry = new Mollitia.Retry({
      attempts: 2
    });
    retry.on('retry', onEvent);
    const timeout = new Mollitia.Timeout({
      delay: 500
    });
    timeout.on('timeout', onEvent);
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [
          retry,
          timeout
        ]
      }
    });
    await expect(circuit.fn(failureAsync).execute('dummy', 1000)).rejects.toBeInstanceOf(Mollitia.TimeoutError);
    expect(onEvent).toHaveBeenNthCalledWith(1, circuit); // Timeout
    expect(onEvent).toHaveBeenNthCalledWith(2, circuit, 1); // First Retry
    expect(onEvent).toHaveBeenNthCalledWith(3, circuit); // Timeout
    expect(onEvent).toHaveBeenNthCalledWith(4, circuit, 2); // Second Retry
    expect(onEvent).toHaveBeenNthCalledWith(5, circuit); // Timeout
    circuit.modules = [timeout, retry];
    await expect(circuit.fn(failureAsync).execute('dummy', 1000)).rejects.toBeInstanceOf(Mollitia.TimeoutError);
    expect(onEvent).toHaveBeenNthCalledWith(6, circuit); // Timeout
  });
  it('should retry every 100ms', async () => {
    expect.assertions(5);
    const retry = new Mollitia.Retry({
      attempts: 2,
      interval: 500
    });
    const onRetry = jest.fn();
    retry.on('retry', onRetry);
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [
          retry
        ]
      }
    });
    circuit.fn(failureAsync).execute('dummy', 100)
      .catch((err) => {
        expect(err).toEqual('dummy');
      });
    expect(onRetry).not.toHaveBeenNthCalledWith(1, circuit, 1);
    await delay(700);
    expect(onRetry).toHaveBeenNthCalledWith(1, circuit, 1);
    expect(onRetry).not.toHaveBeenNthCalledWith(2, circuit, 2);
    await delay(700);
    expect(onRetry).toHaveBeenNthCalledWith(2, circuit, 2);
  });
  it('should allow to filter for rejections and set retry interval', async () => {
    expect.assertions(7);
    const retry = new Mollitia.Retry({
      attempts: 2,
      interval: 500,
      onRejection: (err) => {
        if (err === 'should-stop') {
          return false;
        } else if (err === 'should-wait') {
          return 1000;
        } else {
          return true;
        }
      }
    });
    const onRetry = jest.fn();
    retry.on('retry', onRetry);
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [
          retry
        ]
      }
    });
    circuit.fn(failureAsync).execute('should-stop')
      .catch((err) => {
        expect(err).toEqual('should-stop');
      });
    expect(onRetry).not.toHaveBeenNthCalledWith(1, circuit, 1);
    await delay(100);
    circuit.fn(failureAsync).execute('should-wait')
      .catch((err) => {
        expect(err).toEqual('should-wait');
      });
    await delay(100);
    expect(onRetry).not.toHaveBeenNthCalledWith(1, circuit, 1);
    await delay(400);
    expect(onRetry).not.toHaveBeenNthCalledWith(1, circuit, 1);
    await delay(600);
    expect(onRetry).toHaveBeenNthCalledWith(1, circuit, 1);
    await delay(1000);
    expect(onRetry).toHaveBeenNthCalledWith(2, circuit, 2);
  });
  it('Failure case - Should not retry', async () => {
    const retry = new Mollitia.Retry({
    attempts: 4,
    onRejection: (_, nbTry) => {
      if (nbTry === 2) {
        return false;
      }
      return true;
    }
    });
    const onRetry = jest.fn();
    retry.on('retry', onRetry);
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [
          retry
        ]
      }
    });
    await circuit.fn(failureAsync).execute('dummy')
      .catch((err) => {
        expect(err).toEqual('dummy');
      });
    await delay(500);
    expect(onRetry).toHaveBeenCalledTimes(2);
  });
  it('should emit success-without-retry events for retries', async () => {
    const retry = new Mollitia.Retry({
      attempts: 0,
      interval: 100
    });
    const onSuccessWithoutRetry = jest.fn();
    retry.on('success-without-retry', onSuccessWithoutRetry);
    const onSuccessWithRetry = jest.fn();
    retry.on('success-with-retry', onSuccessWithRetry);
    const onFailuresWithoutRetry = jest.fn();
    retry.on('failure-without-retry', onFailuresWithoutRetry);
    const onFailuresWithRetry = jest.fn();
    retry.on('failure-with-retry', onFailuresWithRetry);
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [
          retry
        ]
      }
    });
    // Success Without Retries
    await circuit.fn(successAsync).execute('dummy', 100);
    expect(onSuccessWithoutRetry).toHaveBeenNthCalledWith(1, circuit);
    retry.attempts = 1;
    await circuit.fn(successAsync).execute('dummy', 100);
    retry.attempts = 2;
    await circuit.fn(successAsync).execute('dummy', 100);
    expect(onSuccessWithoutRetry).toHaveBeenNthCalledWith(1, circuit);
    expect(onSuccessWithoutRetry).toHaveBeenNthCalledWith(2, circuit);
    expect(onSuccessWithoutRetry).toHaveBeenNthCalledWith(3, circuit);
    expect(onSuccessWithRetry).not.toHaveBeenCalled();
    expect(onFailuresWithoutRetry).not.toHaveBeenCalled();
    expect(onFailuresWithRetry).not.toHaveBeenCalled();
  });
  it('should emit success-with-retry events for retries', async () => {
    let currentAttempts = 0;
    const successAsyncAfterNth = jest.fn().mockImplementation((attempts, res: unknown = 'default', delay = 1) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (currentAttempts !== attempts) {
            currentAttempts++;
            reject(res);
          } else {
            currentAttempts = 0;
            resolve(res);
          }
        }, delay);
      });
    });
    const retry = new Mollitia.Retry({
      attempts: 1,
      interval: 100
    });
    const onSuccessWithoutRetry = jest.fn();
    retry.on('success-without-retry', onSuccessWithoutRetry);
    const onSuccessWithRetry = jest.fn();
    retry.on('success-with-retry', onSuccessWithRetry);
    const onFailuresWithoutRetry = jest.fn();
    retry.on('failure-without-retry', onFailuresWithoutRetry);
    const onFailuresWithRetry = jest.fn();
    retry.on('failure-with-retry', onFailuresWithRetry);
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [
          retry
        ]
      }
    });
    // Success With Retries
    await circuit.fn(successAsyncAfterNth).execute(1, 'dummy', 100);
    expect(onSuccessWithRetry).toHaveBeenNthCalledWith(1, circuit, 1);
    retry.attempts = 2;
    await circuit.fn(successAsyncAfterNth).execute(1, 'dummy', 100);
    expect(onSuccessWithRetry).toHaveBeenNthCalledWith(1, circuit, 1);
    expect(onSuccessWithRetry).toHaveBeenNthCalledWith(2, circuit, 1);
    expect(onSuccessWithoutRetry).not.toHaveBeenCalled();
    expect(onFailuresWithoutRetry).not.toHaveBeenCalled();
    expect(onFailuresWithRetry).not.toHaveBeenCalled();
  });
  it('should emit failure-without-retry events for retries', async () => {
    const retry = new Mollitia.Retry({
      attempts: 0,
      interval: 100
    });
    const onSuccessWithoutRetry = jest.fn();
    retry.on('success-without-retry', onSuccessWithoutRetry);
    const onSuccessWithRetry = jest.fn();
    retry.on('success-with-retry', onSuccessWithRetry);
    const onFailuresWithoutRetry = jest.fn();
    retry.on('failure-without-retry', onFailuresWithoutRetry);
    const onFailuresWithRetry = jest.fn();
    retry.on('failure-with-retry', onFailuresWithRetry);
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [
          retry
        ]
      }
    });
    // Failure Without Retries
    retry.attempts = 0;
    await expect(circuit.fn(failureAsync).execute('dummy', 100)).rejects.toEqual('dummy');
    expect(onFailuresWithoutRetry).toHaveBeenNthCalledWith(1, circuit);
    retry.attempts = 1;
    retry.onRejection = () => false;
    await expect(circuit.fn(failureAsync).execute('dummy', 100)).rejects.toEqual('dummy');
    retry.attempts = 2;
    await expect(circuit.fn(failureAsync).execute('dummy', 100)).rejects.toEqual('dummy');
    expect(onFailuresWithoutRetry).toHaveBeenNthCalledWith(1, circuit);
    expect(onFailuresWithoutRetry).toHaveBeenNthCalledWith(2, circuit);
    expect(onFailuresWithoutRetry).toHaveBeenNthCalledWith(3, circuit);
    expect(onSuccessWithoutRetry).not.toHaveBeenCalled();
    expect(onSuccessWithRetry).not.toHaveBeenCalled();
    expect(onFailuresWithRetry).not.toHaveBeenCalled();
  });
  it('should emit failure-with-retry events for retries', async () => {
    const retry = new Mollitia.Retry({
      attempts: 1,
      interval: 100
    });
    const onSuccessWithoutRetry = jest.fn();
    retry.on('success-without-retry', onSuccessWithoutRetry);
    const onSuccessWithRetry = jest.fn();
    retry.on('success-with-retry', onSuccessWithRetry);
    const onFailuresWithoutRetry = jest.fn();
    retry.on('failure-without-retry', onFailuresWithoutRetry);
    const onFailuresWithRetry = jest.fn();
    retry.on('failure-with-retry', onFailuresWithRetry);
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [
          retry
        ]
      }
    });
    // Failure With Retries
    retry.onRejection = () => true;
    await expect(circuit.fn(failureAsync).execute('dummy', 100)).rejects.toEqual('dummy');
    expect(onFailuresWithRetry).toHaveBeenNthCalledWith(1, circuit, 1);
    retry.attempts = 2;
    retry.onRejection = (err, attempt) => {
      // Only cancel rejection on second attempt
      return (attempt === 1) ? false : true;
    };
    await expect(circuit.fn(failureAsync).execute('dummy', 100)).rejects.toEqual('dummy');
    expect(onFailuresWithRetry).toHaveBeenNthCalledWith(2, circuit, 1);
    expect(onSuccessWithoutRetry).not.toHaveBeenCalled();
    expect(onSuccessWithRetry).not.toHaveBeenCalled();
    expect(onFailuresWithoutRetry).not.toHaveBeenCalled();
  });
  it('should retry the function multiple times - Default mode (constant)', async () => {
    const retry = new Mollitia.Retry({
      attempts: 3,
      interval: 500
    });
    const onRetry = jest.fn();
    const onDelayBeforeNextRetry = jest.fn();
    retry.on('retry', onRetry);
    retry.on('delay-before-next-retry', onDelayBeforeNextRetry);
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [
          retry
        ]
      }
    });
    // Wait 500ms before first retry
    // Wait 500ms before second retry
    // Wait 500ms before third retry
    circuit.fn(failureAsync).execute('dummy')
      .catch((err) => {
        expect(err).toEqual('dummy');
      });
    await delay(350);
    expect(onRetry).not.toHaveBeenNthCalledWith(1, circuit, 1);
    await delay(350);
    expect(onRetry).toHaveBeenNthCalledWith(1, circuit, 1);
    expect(onDelayBeforeNextRetry).toHaveBeenNthCalledWith(1, circuit, 500);
    await delay(250);
    expect(onRetry).not.toHaveBeenNthCalledWith(2, circuit, 2);
    await delay(250);
    expect(onRetry).toHaveBeenNthCalledWith(2, circuit, 2);
    expect(onDelayBeforeNextRetry).toHaveBeenNthCalledWith(2, circuit, 500);
    await delay(250);
    expect(onRetry).not.toHaveBeenNthCalledWith(3, circuit, 3);
    await delay(250);
    expect(onRetry).toHaveBeenNthCalledWith(3, circuit, 3);
    expect(onDelayBeforeNextRetry).toHaveBeenNthCalledWith(3, circuit, 500);
  });
  it('should retry the function multiple times - Constant mode - FastFirst', async () => {
    const retry = new Mollitia.Retry({
      attempts: 2,
      interval: 500,
      fastFirst: true
    });
    const onRetry = jest.fn();
    const onDelayBeforeNextRetry = jest.fn();
    retry.on('retry', onRetry);
    retry.on('delay-before-next-retry', onDelayBeforeNextRetry);
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [
          retry
        ]
      }
    });
    // Wait 0ms before first retry
    // Wait 500ms before second retry
    circuit.fn(failureAsync).execute('dummy')
      .catch((err) => {
        expect(err).toEqual('dummy');
      });
    await delay(100);
    expect(onRetry).toHaveBeenNthCalledWith(1, circuit, 1);
    expect(onDelayBeforeNextRetry).toHaveBeenNthCalledWith(1, circuit, 0);
    await delay(350);
    expect(onRetry).not.toHaveBeenNthCalledWith(2, circuit, 2);
    await delay(350);
    expect(onRetry).toHaveBeenNthCalledWith(2, circuit, 2);
    expect(onDelayBeforeNextRetry).toHaveBeenNthCalledWith(2, circuit, 500);
  });
  it('should retry the function multiple times - Linear mode', async () => {
    const retry = new Mollitia.Retry({
      attempts: 3,
      interval: 500,
      mode: Mollitia.RetryMode.LINEAR
    });
    const onRetry = jest.fn();
    const onDelayBeforeNextRetry = jest.fn();
    retry.on('retry', onRetry);
    retry.on('delay-before-next-retry', onDelayBeforeNextRetry);
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [
          retry
        ]
      }
    });
    // Wait 500ms before first retry
    // Wait 1000ms before second retry
    // Wait 1500ms before third retry
    circuit.fn(failureAsync).execute('dummy')
      .catch((err) => {
        expect(err).toEqual('dummy');
      });
    await delay(350);
    expect(onRetry).not.toHaveBeenNthCalledWith(1, circuit, 1);
    await delay(350);
    expect(onRetry).toHaveBeenNthCalledWith(1, circuit, 1);
    expect(onDelayBeforeNextRetry).toHaveBeenNthCalledWith(1, circuit, 500);
    await delay(750);
    expect(onRetry).not.toHaveBeenNthCalledWith(2, circuit, 2);
    await delay(250);
    expect(onRetry).toHaveBeenNthCalledWith(2, circuit, 2);
    expect(onDelayBeforeNextRetry).toHaveBeenNthCalledWith(2, circuit, 1000);
    await delay(1250);
    expect(onRetry).not.toHaveBeenNthCalledWith(3, circuit, 3);
    await delay(250);
    expect(onRetry).toHaveBeenNthCalledWith(3, circuit, 3);
    expect(onDelayBeforeNextRetry).toHaveBeenNthCalledWith(3, circuit, 1500);
  });
  it('should retry the function multiple times - FastFirst and MaxInterval - Linear Mode', async () => {
    const retry = new Mollitia.Retry({
      attempts: 3,
      interval: 500,
      mode: Mollitia.RetryMode.LINEAR,
      fastFirst: true,
      maxInterval: 530
    });
    const onRetry = jest.fn();
    const onDelayBeforeNextRetry = jest.fn();
    retry.on('retry', onRetry);
    retry.on('delay-before-next-retry', onDelayBeforeNextRetry);
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [
          retry
        ]
      }
    });
    // Wait 0ms before first retry
    // Wait 500ms before second retry
    // Wait 530ms before third retry (due to max interval)
    circuit.fn(failureAsync).execute('dummy')
      .catch((err) => {
        expect(err).toEqual('dummy');
      });
    await delay(100);
    expect(onRetry).toHaveBeenNthCalledWith(1, circuit, 1);
    expect(onDelayBeforeNextRetry).toHaveBeenNthCalledWith(1, circuit, 0);
    await delay(250);
    expect(onRetry).not.toHaveBeenNthCalledWith(2, circuit, 2);
    await delay(250);
    expect(onRetry).toHaveBeenNthCalledWith(2, circuit, 2);
    expect(onDelayBeforeNextRetry).toHaveBeenNthCalledWith(2, circuit, 500);
    await delay(250);
    expect(onRetry).not.toHaveBeenNthCalledWith(3, circuit, 3);
    await delay(250);
    expect(onRetry).toHaveBeenNthCalledWith(3, circuit, 3);
    expect(onDelayBeforeNextRetry).toHaveBeenNthCalledWith(3, circuit, 530);
  });
  it('should retry the function multiple times - EXPONENTIAL mode', async () => {
    const retry = new Mollitia.Retry({
      attempts: 3,
      interval: 500,
      mode: Mollitia.RetryMode.EXPONENTIAL,
      factor: 2
    });
    const onRetry = jest.fn();
    const onDelayBeforeNextRetry = jest.fn();
    retry.on('retry', onRetry);
    retry.on('delay-before-next-retry', onDelayBeforeNextRetry);
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [
          retry
        ]
      }
    });
    // Wait 500ms before first retry
    // Wait 500ms * 2 (1000ms) before second retry
    // Wait 500ms * 4 (2000ms) before third retry
    circuit.fn(failureAsync).execute('dummy')
      .catch((err) => {
        expect(err).toEqual('dummy');
      });
    await delay(350);
    expect(onRetry).not.toHaveBeenNthCalledWith(1, circuit, 1);
    await delay(250);
    expect(onRetry).toHaveBeenNthCalledWith(1, circuit, 1);
    expect(onDelayBeforeNextRetry).toHaveBeenNthCalledWith(1, circuit, 500);
    await delay(750);
    expect(onRetry).not.toHaveBeenNthCalledWith(2, circuit, 2);
    await delay(250);
    expect(onRetry).toHaveBeenNthCalledWith(2, circuit, 2);
    expect(onDelayBeforeNextRetry).toHaveBeenNthCalledWith(2, circuit, 1000);
    await delay(1750);
    expect(onRetry).not.toHaveBeenNthCalledWith(3, circuit, 3);
    await delay(250);
    expect(onRetry).toHaveBeenNthCalledWith(3, circuit, 3);
    expect(onDelayBeforeNextRetry).toHaveBeenNthCalledWith(3, circuit, 2000);
  });
  it('should retry the function multiple times - EXPONENTIAL mode - MaxTimeout', async () => {
    const retry = new Mollitia.Retry({
      attempts: 3,
      interval: 500,
      mode: Mollitia.RetryMode.EXPONENTIAL,
      factor: 4,
      maxInterval: 1000
    });
    const onRetry = jest.fn();
    const onDelayBeforeNextRetry = jest.fn();
    retry.on('retry', onRetry);
    retry.on('delay-before-next-retry', onDelayBeforeNextRetry);
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [
          retry
        ]
      }
    });
    // Wait 500ms before first retry
    // Wait supposed to be 500ms * 4 (2000ms) before second retry, but Wait 1000ms due to MaxInterval
    // Wait 500ms * 16 (8000ms) before third retry, but Wait 1000ms due to MaxInterval
    circuit.fn(failureAsync).execute('dummy')
      .catch((err) => {
        expect(err).toEqual('dummy');
      });
    await delay(350);
    expect(onRetry).not.toHaveBeenNthCalledWith(1, circuit, 1);
    await delay(250);
    expect(onRetry).toHaveBeenNthCalledWith(1, circuit, 1);
    expect(onDelayBeforeNextRetry).toHaveBeenNthCalledWith(1, circuit, 500);
    await delay(750);
    expect(onRetry).not.toHaveBeenNthCalledWith(2, circuit, 2);
    await delay(250);
    expect(onRetry).toHaveBeenNthCalledWith(2, circuit, 2);
    expect(onDelayBeforeNextRetry).toHaveBeenNthCalledWith(2, circuit, 1000);
    await delay(750);
    expect(onRetry).not.toHaveBeenNthCalledWith(3, circuit, 3);
    await delay(250);
    expect(onRetry).toHaveBeenNthCalledWith(3, circuit, 3);
    expect(onDelayBeforeNextRetry).toHaveBeenNthCalledWith(3, circuit, 1000);
  });
  it('should retry the function multiple times - JITTER mode', async () => {
    const retry = new Mollitia.Retry({
      attempts: 3,
      interval: 300,
      mode: Mollitia.RetryMode.JITTER,
      factor: 3,
      maxInterval: 1000,
      jitterAdjustment: 0.2
    });
    const onRetry = jest.fn();
    const onDelayBeforeNextRetry = jest.fn();
    retry.on('retry', onRetry);
    retry.on('delay-before-next-retry', onDelayBeforeNextRetry);
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [
          retry
        ]
      }
    });
    jest.spyOn(Math, 'random').mockReturnValue(0.6);
    // With JitterAdjustment set to 0.2 and interval set to 300ms:
    // Before 1st try:
    // Base time: 300ms * 3^0 = 300ms
    // MinValue = 300ms - (300ms * 0.2) = 240ms
    // MaxValue = 300ms + (300ms * 0.2) = 360ms
    // Value to Wait = 240ms + ((360 - 240)*random(0.6 here)) = 312ms before first retry
    // Before 2nd try:
    // Base time: 300ms * 3^1 = 900ms
    // MinValue = 900ms - (900ms * 0.2) = 720ms
    // MaxValue = 900ms + (900ms * 0.2) = 1080ms
    // MaxValue is greator than maxInterval, so MaxInterval used as MaxValue
    // Value to Wait = 720ms + ((1000 - 720)*random(0.6 here)) = 888ms before second retry
    // Before 3rd try:
    // Base time: 300ms * 3^2 = 2700ms
    // Base time > Max Interval, so use Max Interval as Base time
    // MinValue = 1000ms - (1000ms * 0.2) = 800ms
    // MaxValue = 1000ms
    // Value to Wait = 800ms + ((1000 - 800)*random) = 920ms before third retry
    circuit.fn(failureAsync).execute('dummy')
      .catch((err) => {
        expect(err).toEqual('dummy');
      });
    await delay(400); //400ms waited. 1st retry occurs after 312ms so 1st retry should have been done
    expect(onRetry).toHaveBeenNthCalledWith(1, circuit, 1);
    expect(onDelayBeforeNextRetry).toHaveBeenNthCalledWith(1, circuit, 312);
    await delay(600); //1000ms waited since the beginning.
    // 2nd retry occurs 312ms + 936ms = 1248ms after the beginning of the test.Should not have been done yet
    expect(onRetry).not.toHaveBeenNthCalledWith(2, circuit, 2);
    await delay(500); //1500ms waited since the beginning.
    expect(onRetry).toHaveBeenNthCalledWith(2, circuit, 2);
    expect(onDelayBeforeNextRetry).toHaveBeenNthCalledWith(2, circuit, 888);
    await delay(500); //2000ms waited since the beginning.
    // 3nd retry occurs 312ms + 936ms + 920 = 2168ms after the beginning of the test.Should not have been done yet
    expect(onRetry).not.toHaveBeenNthCalledWith(3, circuit, 3);
    await delay(500); //2500ms waited since the beginning
    expect(onRetry).toHaveBeenNthCalledWith(3, circuit, 3);
    expect(onDelayBeforeNextRetry).toHaveBeenNthCalledWith(3, circuit, 920);
  });
  it('No Retry attempt configured - Failure and Success cases', async () => {
    const retry = new Mollitia.Retry({
      attempts: 0
    });
    const onRetry = jest.fn();
    retry.on('retry', onRetry);
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [
          retry
        ]
      }
    });
    await circuit.fn(failureAsync).execute('dummy')
      .catch((err) => {
        expect(err).toEqual('dummy');
      });
    await delay(100);
    expect(onRetry).not.toHaveBeenCalled();
    await circuit.fn(successAsync).execute('dummy');
    await delay(100);
    expect(onRetry).not.toHaveBeenCalled();
  });
  it('Success case', async () => {
    const retry = new Mollitia.Retry({
      attempts: 2
    });
    const onRetry = jest.fn();
    retry.on('retry', onRetry);
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [
          retry
        ]
      }
    });
    await circuit.fn(successAsync).execute('dummy');
    await delay(100);
    expect(onRetry).not.toHaveBeenCalled();
  });
  it('Check logger', async () => {
    const debugFn = jest.fn();
    const retry = new Mollitia.Retry({
      name: 'retryExtendedMod',
      logger: {
        info: debugFn,
        warn: debugFn,
        debug: debugFn
      }
    });
    const onRetry = jest.fn();
    retry.on('retry', onRetry);
    const circuit = new Mollitia.Circuit({
      name: 'circuitWithRetryExtended',
      options: {
        modules: [
          retry
        ]
      }
    });
    circuit.fn(failureAsync).execute('dummy')
      .catch((err) => {
        expect(err).toEqual('dummy');
      });
    await delay(100);
    expect(onRetry).toHaveBeenNthCalledWith(1, circuit, 1);
    expect(onRetry).toHaveBeenNthCalledWith(2, circuit, 2);
    expect(debugFn).toHaveBeenNthCalledWith(1, 'circuitWithRetryExtended/retryExtendedMod - Retry: (1/2)');
    expect(debugFn).toHaveBeenNthCalledWith(2, 'circuitWithRetryExtended/retryExtendedMod - Retry: (2/2)');
  });
});
