// Helpers
import { defineLibConfig } from '../../../shared/vite/index.js';
import { version } from './package.json';

export default defineLibConfig({
  name: 'Mollitia',
  base: './src',
  entry: ['./index.ts'],
  version
});
