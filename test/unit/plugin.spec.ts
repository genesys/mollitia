import * as Mollitia from '../../src/index';

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

describe('Plugin', () => {
  afterEach(() => {
    successAsync.mockClear();
    failureAsync.mockClear();
  });
  it('should call lifecycle methods', async () => {
    const plugin: Mollitia.Plugin = {
      onCircuitCreate: jest.fn(),
      onModuleCreate: jest.fn()
    };
    Mollitia.use(plugin);
    const circuitOptions = {
      modules: []
    };
    const circuit = new Mollitia.Circuit({ options: circuitOptions });
    expect(plugin.onCircuitCreate).toHaveBeenCalledWith(circuit, circuitOptions);
    const timeoutOptions = {
      delay: 0
    };
    const timeout = new Mollitia.Timeout(timeoutOptions);
    expect(plugin.onModuleCreate).toHaveBeenCalledWith(timeout, timeoutOptions);
  });
});
