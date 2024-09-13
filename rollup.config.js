import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import swc from '@rollup/plugin-swc';

import addShebang from 'rollup-plugin-add-shebang';
import tsConfigPaths from "rollup-plugin-tsconfig-paths";

import glob from 'glob';
import path from 'node:path';
import { fileURLToPath } from 'url';

import cleaner from 'rollup-plugin-cleaner';
import copy from 'rollup-plugin-copy';
import { dts } from 'rollup-plugin-dts';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

// Convert the import.meta.url to a file path
const __filename = fileURLToPath(import.meta.url);

// Get the directory name from the file path
const __dirname = path.dirname(__filename);

function getInputsFromGlob(pattern) {
  return glob.sync(pattern).reduce((inputs, file) => {
    const name = path.basename(file, path.extname(file));
    if (name === 'public_api') return inputs;
    inputs.push(file);
    return inputs;
  }, []);
}

const tsFilesInBin = getInputsFromGlob('bin/*.ts');

const basePlugins = [
  tsConfigPaths(),
  peerDepsExternal(),
  nodeResolve({ extensions: [".ts", ".js", ".json"] }),
  swc({
    include: /\.ts?$/,
    jsc: {
      parser: {
        syntax: 'typescript',
        tsx: false,
      },
      baseUrl: '.',
      target: 'ES2021',
    },
    module: {
      type: 'commonjs',
    },
    tsconfig: path.resolve(__dirname, 'tsconfig.json'),
  }),
  json()
];
const baseExternal = [
  '@angular-devkit/core',
  '@angular-devkit/schematics-cli',
  '@angular-devkit/schematics',
  '@angular/cli',
  '@nestjs/cli',
  'ansi-colors',
  'axios',
  'child_process',
  'commander',
  'form-data',
  'fs',
  'node-emoji',
  'node:fs/promises',
  'node:module',
  'npm-package-arg',
  'npm-registry-fetch',
  'ora',
  'path',
  'rxjs',
  'tty',
  'winston-console-format',
  'winston',
];

export default [
  {
    input: 'src/public_api.ts', // Replace with the entry point of your CLI
    output: [
      {
        dir: 'dist',
        format: 'cjs',
      },
    ],
    plugins: [
      ...basePlugins,
      cleaner({
        targets: ['./dist/'],
      }),
      copy({
        targets: [
          {
            src: 'package.json',
            dest: 'dist',
            transform: (contents) => {
              const packageData = JSON.parse(contents.toString());
              delete packageData.scripts;
              delete packageData.devDependencies;
              delete packageData.keywords;
              delete packageData.engines;
              return JSON.stringify(packageData, null, 2);
            },
          },
          {
            src: 'README.md',
            dest: 'dist',
          },
        ],
        hook: 'writeBundle',
      }),
    ],
  },
  {
    input: 'src/public_api.ts', // Adjust this if you have multiple or different entry points
    output: [{ file: 'dist/public_api.d.ts', format: 'es' }],
    plugins: [dts()],
  },

  ...tsFilesInBin.map((file) => ({
    input: file,
    output: {
      dir: 'dist/bin',
      format: 'cjs',
      exports: 'auto',
    },
    plugins: [
      ...basePlugins,
      addShebang({
        include: 'dist/bin/builder.js',
      }),
    ],
    external: baseExternal,
  })),
  ...tsFilesInBin.map((file) => ({
    input: file,
    output: {
      dir: 'dist/bin',
      format: 'cjs',
      exports: 'auto',
    },
    plugins: [dts()],
  }))
];
