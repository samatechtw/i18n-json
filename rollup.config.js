import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import { terser } from 'rollup-plugin-terser'
import builtins from 'builtin-modules'

const pkg = require('./package.json')

export default [
  {
    input: 'dist/cli.js',
    output: [
      {
        exports: 'named',
        file: pkg.main,
        sourcemap: true,
        name: 'i18n-json',
        format: 'cjs',
      },
    ],
    external: [builtins],
    plugins: [resolve({ preferBuiltins: true }), commonjs(), sourceMaps(), terser()],
  },
]
