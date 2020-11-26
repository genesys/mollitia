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

describe('Addon', () => {
  afterEach(() => {
    successAsync.mockClear();
    failureAsync.mockClear();
  });
  it('should call lifecycle methods', async () => {
    const addon: Mollitia.Addon = {
      onCircuitCreate: jest.fn(),
      onModuleCreate: jest.fn()
    };
    Mollitia.use(addon);
    const circuitOptions = {
      modules: []
    };
    const circuit = new Mollitia.Circuit({ options: circuitOptions });
    expect(addon.onCircuitCreate).toHaveBeenCalledWith(circuit, circuitOptions);
    const timeoutOptions = {
      delay: 0
    };
    const timeout = new Mollitia.Timeout(timeoutOptions);
    expect(addon.onModuleCreate).toHaveBeenCalledWith(timeout, timeoutOptions);
  });
});
