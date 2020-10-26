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

describe('Bulkhead', () => {
  afterEach(() => {
    successAsync.mockClear();
    failureAsync.mockClear();
  });
  it('should add to concurrent buffer', async () => {
    const bulkhead = new Mollitia.Bulkhead({
      concurrentSize: 2
    });
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [
          bulkhead
        ]
      }
    });
    await expect(circuit.fn(successAsync).execute('dummy', 100)).resolves.toEqual('dummy');
  });
});
