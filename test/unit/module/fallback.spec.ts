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

describe('Fallback', () => {
  afterEach(() => {
    successAsync.mockClear();
    failureAsync.mockClear();
  });
  it('should permit to filter the rejection value', async () => {
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [
          new Mollitia.Fallback({
            cb (value: string) {
              expect(value).toEqual('dummy');
              return 'fallback';
            }
          })
        ]
      }
    });
    await expect(circuit.fn(failureAsync).execute('dummy')).rejects.toEqual('fallback');
  });
});
