import * as Mollitia from '../../../src/index';
import { delay } from '../../../src/helpers/time';

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

describe('Ratelimit', () => {
  afterEach(() => {
    successAsync.mockClear();
    failureAsync.mockClear();
  });
  it('With a single ratelimit', async () => {
    expect.assertions(13);
    const ratelimit = new Mollitia.Ratelimit({
      limitPeriod: 1000,
      limitForPeriod: 3,
      name: 'dummy-name'
    });
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [
          ratelimit
        ]
      }
    });
    await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy'); // 0: t0 (0)
    await delay(200);
    await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy'); // 1: t0 + 200ms (0, 200)
    await delay(400);
    await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy'); // 2: t0 + 600ms (0, 200, 600)
    await delay(300);
    await expect(circuit.fn(successAsync).execute('dummy')).rejects.toBeInstanceOf(Mollitia.RatelimitError); // t0 + 900ms: Already 3 request
    await delay(100);
    await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy'); // t0 + 1000ms: Ok (200, 600, 1000)
    await delay(100);
    await expect(circuit.fn(successAsync).execute('dummy')).rejects.toBeInstanceOf(Mollitia.RatelimitError); // t0 + 1100ms: Nok
    await delay(100);
    await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy'); // t0 + 1200ms: Ok (600, 1000, 1200)
    await delay(300);
    try {
      await circuit.fn(successAsync).execute('dummy'); // t0 + 1500: Nok
    } catch (err) {
      expect(err).toBeInstanceOf(Mollitia.RatelimitError);
      expect(err).toHaveProperty('name', 'dummy-name');
    }
    await delay(200);
    await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy'); // t0 + 1700ms: Ok (1000, 1200, 1700)
    await delay(200);
    await expect(circuit.fn(successAsync).execute('dummy')).rejects.toBeInstanceOf(Mollitia.RatelimitError); // t0 + 1900: Nok
    await delay(300);
    await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy'); // t0 + 2200: Ok (1200, 1700, 2200)
    await delay(1);
    await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy'); // t0 + 2201: Ok (1700, 2200, 2201)
  });
  it('With two ratelimits', async () => {
    const ratelimit = new Mollitia.Ratelimit({
      limitPeriod: 1000,
      limitForPeriod: 3
    });
    const ratelimit2 = new Mollitia.Ratelimit({
      limitPeriod: 200,
      limitForPeriod: 1
    });
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [
          ratelimit2,
          ratelimit
        ]
      }
    });
    await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');//t0
    await delay(100);
    await expect(circuit.fn(successAsync).execute('dummy')).rejects.toBeInstanceOf(Mollitia.RatelimitError);//t0 + 100: Nok (ratelimit2)
    await delay(100);
    await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');//t0 + 200: Ok (0, 200)
    await delay(500);
    await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');//t0 + 700: Ok (0, 200, 700)
    await delay(200);
    await expect(circuit.fn(successAsync).execute('dummy')).rejects.toBeInstanceOf(Mollitia.RatelimitError);//t0 + 900ms: Nok (0,200,700)
    await delay(400);
    await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');//t0 + 1300ms: Ok (200, 700, 1300)
    await delay(1);
    await expect(circuit.fn(successAsync).execute('dummy')).rejects.toBeInstanceOf(Mollitia.RatelimitError);//t0 + 1301: NOk (ratelimit2)
  });
});
