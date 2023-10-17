import { describe, afterEach, it, expect } from 'vitest';
import * as Mollitia from '../../src/index.js';
import { successAsync, failureAsync } from '../../../../shared/vite/utils/vitest.js';

describe('Entry', () => {
  afterEach(() => {
    successAsync.mockClear();
    failureAsync.mockClear();
  });
  it('should export the Circuit class', () => {
    expect(Mollitia.Circuit).toBeDefined();
    expect(Mollitia.circuits.length).toEqual(0);
  });
});
