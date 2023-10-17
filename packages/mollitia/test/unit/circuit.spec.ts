import { describe, afterEach, it, expect } from 'vitest';
import * as Mollitia from '../../src/index.js';
import { successAsync, failureAsync } from '../../../../shared/vite/utils/vitest.js';

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
