// Helpers
import { defineLibConfig } from '../../../shared/vite/index.js';
import { version } from './package.json';

export default defineLibConfig(
  {
    name: 'MollitiaPrometheus',
    base: './src',
    entry: ['./index.ts'],
    version
  },
  () => ({
    build: {
      rollupOptions: {
        external: ['mollitia'],
        output: {
          globals: {
            mollitia: 'mollitia'
          }
        }
      }
    }
  })
);
