// rslib.config.ts
import { defineConfig } from '@rslib/core'

export default defineConfig({
  // 1) Single entry: your CLI
  source: {
    entry: {
      builder: './bin/builder.ts',
    },
    tsconfigPath: './tsconfig.json',
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
        'winston',
        'winston-console-format',
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
      },
    },
  ],

  // 3) Node target & cleanup
  output: {
    target: 'node',
    cleanDistPath: true, // like Vite's emptyOutDir
  },
})
