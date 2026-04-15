// rslib.config.ts
import { defineConfig } from '@rslib/core'
import pkg from './package.json'

export default defineConfig({
  // 1) Single entry: your CLI
  source: {
    entry: {
      builder: './bin/builder.ts',
    },
    tsconfigPath: './tsconfig.json',
    define: {
      __PKG_VERSION__: JSON.stringify(pkg.version),
    },
  },

  // 2) One bundled CJS build
  lib: [
    {
      format: 'cjs',      // Node CLI ⇒ CommonJS
      syntax: 'es2021',
      bundle: true,       // 👈 IMPORTANT: single bundled file
      dts: false,         // usually you don’t need d.ts for a CLI entry
      output: {
        externals: [
        // your CLI deps
        'supports-color',
        'commander',
        'ansi-colors',
        'node-emoji',
        'ora',
        'pino',
        'pino-pretty',
        'npm-package-arg',
        'npm-registry-fetch',
        'form-data',
        'axios',

        // Angular / Nest CLIs etc. that you spawn / require at runtime
        '@angular/cli',
        '@nestjs/cli',
        '@angular-devkit/schematics-cli',
        '@angular-devkit/core',
        '@angular-devkit/schematics',

        // Node builtins
        'fs',
        'path',
        'child_process',
        /^node:/,
      ],
        distPath: {
          root: './dist',  // output folder
        },
        filename: {
          js: 'builder.js', // 👈 single file: dist/builder.js
        },
        copy: [
          {
            from: './package.json',
            to: '.', // → dist/package.json,
            transform(content) {
              const pkg = JSON.parse(content.toString())

              // Remove fields you don't want in dist
              delete pkg.scripts
              delete pkg.devDependencies
              delete pkg.private
              delete pkg.files
              delete pkg.husky
              delete pkg['lint-staged']
              delete pkg.bun
              delete pkg.type // optional, depending on bundling strategy

              // Fix main/bin to point to the built file
              pkg.main = './builder.js'
              pkg.bin = { builder: './builder.js' }

              // Return cleaned JSON
              return JSON.stringify(pkg, null, 2)
            },
          },
          {
            from: './README.md',
            to: '.', // optional, but usually nice for npm
          },
          {
            from: './LICENSE',
            to: '.', // optional
          },
        ],
      },
    },
  ],

  // 3) Node target & cleanup
  output: {
    target: 'node',
    cleanDistPath: true, // like Vite's emptyOutDir
  },
})
