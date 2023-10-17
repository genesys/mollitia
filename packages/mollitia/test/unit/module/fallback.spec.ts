import { describe, afterEach, it, expect } from 'vitest';
import * as Mollitia from '../../../src/index.js';
import { successAsync, failureAsync } from '../../../../../shared/vite/utils/vitest.js';

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
            callback (value: string) {
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
