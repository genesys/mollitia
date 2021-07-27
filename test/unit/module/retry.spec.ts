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
  it('should retry the function multiple times', async () => {
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
});
