import { describe, afterEach, it, vi, expect } from 'vitest';
import { CircuitFunction } from '../../../src/circuit.js';
import * as Mollitia from '../../../src/index.js';

const successAsync = vi.fn().mockImplementation((res: unknown = 'default', delay = 1) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(res);
    }, delay);
  });
});



describe('Module', () => {
  afterEach(() => {
    successAsync.mockClear();
  });
  it('should be able to create a module', async () => {
    class DummyModule extends Mollitia.Module {
      constructor (options: Mollitia.ModuleOptions = {}) {
        super(options);
      }
      async execute (circuit: Mollitia.Circuit, promise: CircuitFunction, ...params: any[]) {
        const _params = this.getExecParams(circuit, params);
        expect(_params[0]).toEqual('dummy1');
        expect(_params[1]).toEqual('dummy2');
        return promise(...params);
      }
    }
    const dummyModule = new DummyModule();
    const dummyModule2 = new DummyModule();
    const dummyModule3 = new DummyModule();
    const dummyModule4 = new DummyModule();
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [
          dummyModule,
          dummyModule2,
          dummyModule3,
          dummyModule4
        ]
      }
    });
    await expect(circuit.fn(successAsync).execute('dummy1', 'dummy2')).resolves.toEqual('dummy1');
  });
  it('should not execute inactive modules', async () => {
    class DummyModule extends Mollitia.Module {
      constructor (options: Mollitia.ModuleOptions = {}) {
        super(options);
      }
      async execute (circuit: Mollitia.Circuit, promise: CircuitFunction, ...params: any[]) {
        this.emit('execute', this.name);
        return promise(...params);
      }
    }
    const onDummyModuleExecute = vi.fn();
    const dummyModule = new DummyModule({ name: 'dummy1' });
    const dummyModule2 = new DummyModule({ name: 'dummy2', active: true });
    const dummyModule3 = new DummyModule({ name: 'dummy3', active: false });
    const dummyModule4 = new DummyModule({ name: 'dummy4' });
    dummyModule.on('execute', onDummyModuleExecute);
    dummyModule2.on('execute', onDummyModuleExecute);
    dummyModule3.on('execute', onDummyModuleExecute);
    dummyModule4.on('execute', onDummyModuleExecute);
    const circuit = new Mollitia.Circuit({
      options: {
        modules: [
          dummyModule,
          dummyModule2,
          dummyModule3,
          dummyModule4
        ]
      }
    });
    await expect(circuit.fn(successAsync).execute('dummy')).resolves.toEqual('dummy');
    expect(onDummyModuleExecute).toHaveBeenNthCalledWith(1, 'dummy1');
    expect(onDummyModuleExecute).toHaveBeenNthCalledWith(2, 'dummy2');
    expect(onDummyModuleExecute).toHaveBeenNthCalledWith(3, 'dummy4');
  });
});
