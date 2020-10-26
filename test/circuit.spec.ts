import * as Mollitia from '../src/index';

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

describe('Circuit', () => {
  afterEach(() => {
    successAsync.mockClear();
    failureAsync.mockClear();
  });
  it('should reject if no function has been set', async () => {
    const circuit = new Mollitia.Circuit();
    await expect(circuit.execute()).rejects.toBeInstanceOf(Mollitia.NoFuncError);
  });
  it('should execute the function', async () => {
    // If the function has been set in factory
    let circuit = new Mollitia.Circuit({
      func: successAsync
    });
    expect(circuit.execute('dummy')).resolves.toEqual('dummy');
    // If the function has been set via fn
    circuit = new Mollitia.Circuit();
    await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
  });
});
