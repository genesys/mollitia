import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';
import json from 'rollup-plugin-json';

import pkg from './package.json';

const camelName = 'Mollitia';
const docsPackage = 'docs/plugins/libs/mollitia.es5.js';

export default {
  input: 'src/index.ts',
  output: [
    { file: pkg.main, name: camelName, format: 'umd', sourcemap: true },
    { file: pkg.module, format: 'es', sourcemap: true },
    { file: docsPackage, format: 'es', sourcemap: true }
  ],
  watch: {
    include: 'src/**'
  },
  plugins: [
    json(),
    typescript({ useTsconfigDeclarationDir: true }),
    commonjs(),
    resolve(),
    sourceMaps()
  ]
};
