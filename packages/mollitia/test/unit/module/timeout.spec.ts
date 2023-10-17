import { describe, afterEach, it, expect } from 'vitest';
import * as Mollitia from '../../../src/index.js';
import { successAsync, failureAsync } from '../../../../../shared/vite/utils/vitest.js';

describe('Timeout', () => {
  afterEach(() => {
    successAsync.mockClear();
    failureAsync.mockClear();
  });
  it('should timeout the function for circuit', async () => {
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [
          new Mollitia.Timeout({
            delay: 5
          })
        ]
      }
    });
    await expect(circuit.fn(successAsync).execute('dummy', 10)).rejects.toBeInstanceOf(Mollitia.TimeoutError);
  });
});
