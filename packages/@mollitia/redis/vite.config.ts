// Helpers
import { defineLibConfig } from '../../../shared/vite/index.js';
import { version } from './package.json';

export default defineLibConfig(
  {
    name: 'MollitiaRedis',
    base: './src',
    entry: ['./index.ts'],
    version,
    formats: ['cjs','es']
  },
  () => ({
    build: {
      rollupOptions: {
        external: ['redis', 'mollitia'],
        output: {
          globals: {
            mollitia: 'mollitia',
            redis: 'redis'
          }
        }
      }
    }
  })
);
