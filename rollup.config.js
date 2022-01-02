import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'

const pkg = require('./package.json')

export default [
  {
    input: 'src/cli.ts',
    output: [
      {
        exports: 'named',
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
        plugin: [terser()],
      },
    ],
    external: Object.keys(pkg.devDependencies),
    plugins: [typescript(), commonjs(), resolve(), sourceMaps()],
  },
]
