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
    const ratelimit1 = new Mollitia.Ratelimit({
      limitPeriod: 1500,
      limitForPeriod: 3
    });
    const ratelimit2 = new Mollitia.Ratelimit({
      limitPeriod: 500,
      limitForPeriod: 1
    });
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [
          ratelimit2,
          ratelimit1
        ]
      }
    });
    await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy'); // t0
    await delay(250);
    await expect(circuit.fn(successAsync).execute('dummy')).rejects.toBeInstanceOf(Mollitia.RatelimitError); // t0 + 250: Nok (ratelimit2)
    await delay(350);
    await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');// t0 + 600: Ok
    await delay(500);
    await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy'); // t0 + 1100: Ok
    await delay(200);
    await expect(circuit.fn(successAsync).execute('dummy')).rejects.toBeInstanceOf(Mollitia.RatelimitError); // t0 + 1300ms: Nok (ratelimit1)
    await delay(400);
    await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy'); // t0 + 1600ms: Ok
    await delay(1);
    await expect(circuit.fn(successAsync).execute('dummy')).rejects.toBeInstanceOf(Mollitia.RatelimitError);//t0 + 1601: Nok (ratelimit2)
  });
});
