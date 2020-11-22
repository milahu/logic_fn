// https://github.com/ryanmorr/es6-boilerplate/blob/master/rollup.config.js

import pkg from './package.json';
import babel from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

import { preval } from 'rollup-plugin-preval';

const banner = `//! ${pkg.name}-${pkg.version}.js`;

export default {
  input: pkg.source,
  output: [
    { format: 'umd', file: pkg.browser, name: pkg.name, banner },
    { format: 'cjs', file: pkg.main, banner },
    { format: 'esm', file: pkg.module, banner }
  ],
  plugins: [
    preval({ basedir: __dirname }), // directory of rollup.config.js
    nodeResolve(),
    babel({ exclude: 'node_modules/**', babelHelpers: 'bundled' }),
    commonjs(),
    terser({
      ecma: 2020,
      compress: {
        unsafe_arrows: true,
        //unsafe: true,
        passes: 4,
      },
      mangle: {
        reserved: ['logic_fn'],
      }
    })
  ]
};
