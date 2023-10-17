import { describe, afterEach, it, expect } from 'vitest';
import * as Mollitia from '../../../src/index.js';
import { delay } from '../../../src/helpers/time.js';
import { successAsync, failureAsync } from '../../../../../shared/vite/utils/vitest.js';

describe('Bulkhead', () => {
  afterEach(() => {
    successAsync.mockClear();
    failureAsync.mockClear();
  });
  it('should add to concurrent buffer', async () => {
    expect.assertions(6);
    const bulkhead = new Mollitia.Bulkhead({
      concurrentSize: 2,
      queueSize: 2,
      maxQueueWait: 200
    });
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [
          bulkhead
        ]
      }
    });
    circuit.fn(successAsync).execute('dummy1', 50).then((res) => {
      expect(res).toEqual('dummy1');
    });
    circuit.fn(successAsync).execute('dummy2', 300).then((res) => {
      expect(res).toEqual('dummy2');
    });
    circuit.fn(successAsync).execute('dummy3', 50).then((res) => {
      expect(res).toEqual('dummy3');
    });
    circuit.fn(successAsync).execute('dummy4', 200).then((res) => {
      expect(res).toEqual('dummy4');
    });
    circuit.fn(successAsync).execute('dummy5').catch((err) => {
      expect(err).toBeInstanceOf(Mollitia.BulkheadOverloadError);
    });
    await delay(60);
    circuit.fn(successAsync).execute('dummy6').catch((err) => {
      expect(err).toBeInstanceOf(Mollitia.BulkheadQueueWaitError);
    });
    await delay(1000);
  });
});
