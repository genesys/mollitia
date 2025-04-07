// Helpers
import { defineLibConfig } from '../../shared/vite/index.js';
import pkg from './package.json';

export default defineLibConfig({
  name: 'Mollitia',
  base: './src',
  entry: ['./index.ts'],
  version: pkg.version
});
