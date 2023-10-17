import { describe, afterEach, it, vi, expect } from 'vitest';
import * as Mollitia from '../../src/index.js';
import { successAsync, failureAsync } from '../../../../shared/vite/utils/vitest.js';

describe('Addon', () => {
  afterEach(() => {
    successAsync.mockClear();
    failureAsync.mockClear();
  });
  it('should call lifecycle methods', async () => {
    const addon: Mollitia.Addon = {
      onCircuitCreate: vi.fn(),
      onModuleCreate: vi.fn()
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
