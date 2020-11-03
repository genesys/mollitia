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
      delay: 5
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
    await expect(circuit.fn(failureAsync).execute('dummy', 6)).rejects.toBeInstanceOf(Mollitia.TimeoutError);
    expect(onEvent).toHaveBeenNthCalledWith(1, circuit); // Timeout
    expect(onEvent).toHaveBeenNthCalledWith(2, circuit, 1); // First Retry
    expect(onEvent).toHaveBeenNthCalledWith(3, circuit); // Timeout
    expect(onEvent).toHaveBeenNthCalledWith(4, circuit, 2); // Second Retry
    expect(onEvent).toHaveBeenNthCalledWith(5, circuit); // Timeout
    circuit.modules = [timeout, retry];
    await expect(circuit.fn(failureAsync).execute('dummy', 4)).rejects.toBeInstanceOf(Mollitia.TimeoutError);
    expect(onEvent).toHaveBeenNthCalledWith(6, circuit, 1); // Retry
    expect(onEvent).toHaveBeenNthCalledWith(7, circuit); // Timeout
  });
});
