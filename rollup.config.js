import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';
import builtins from 'rollup-plugin-node-builtins';
import addShebang from 'rollup-plugin-add-shebang';
import globals from 'rollup-plugin-node-globals';
import cleaner from 'rollup-plugin-cleaner';

import glob from 'glob';
import path from 'node:path';
import { dts } from 'rollup-plugin-dts';

function getInputsFromGlob(pattern) {
  return glob.sync(pattern).reduce((inputs, file) => {
    const name = path.basename(file, path.extname(file));
    inputs[name] = file;
    return inputs;
  }, {});
}

const removeSrcPattern = /^(src[\/\\])(.*?)/gs;
const normalizeUrl = (url) => url.replace(/\\/g, '/');
const removeSrcPath = (string) => normalizeUrl(string).replace(removeSrcPattern, '$2');

const tsFilesInActions = getInputsFromGlob('actions/*.ts');
const tsFilesInCommands = getInputsFromGlob('commands/*.ts');
const tsFilesInBin = getInputsFromGlob('bin/*.ts');
const tsFilesInEnums = getInputsFromGlob('enums/*.ts');
const tsFilesInInterfaces = getInputsFromGlob('interfaces/*.ts');
const tsFilesInCLI = getInputsFromGlob('lib/CLI/*.ts');
const tsFilesInReaders = getInputsFromGlob('lib/readers/*.ts');
const tsFilesInSchematics = getInputsFromGlob('lib/schematics/*.ts');
const tsFilesInUI = getInputsFromGlob('lib/ui/*.ts');
const tsFilesInUtils = getInputsFromGlob('lib/utils/*.ts');

const basePlugins = [
  typescript({ outputToFilesystem: false }),
  peerDepsExternal(),
  commonjs(),
  builtins(),
  globals(),
  resolve(),
  terser(),
];
const baseExternal = [
  'commander',
  'ansi-colors',
  'tty',
  'node-emoji',
  'fs',
  'path',
  'child_process',
  'node:module',
  '@angular/cli',
  '@nestjs/cli',
  '@angular-devkit/schematics-cli',
];

export default [
  {
    input: 'src/index.ts', // Replace with the entry point of your CLI
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
        silence: false,
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
        ],
        hook: 'writeBundle',
      }),
      copy({
        targets: [
          {
            src: 'README.md',
            dest: 'dist',
          },
          {
            src: 'lib/**/*.json',
            dest: 'dist/',
            rename: (name, extension, fullPath) => {
                return removeSrcPath(fullPath);
            },
          },
        ],
        hook: 'writeBundle',
      }),
    ],
  },
  {
    input: 'src/index.ts', // Adjust this if you have multiple or different entry points
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
  {
    input: tsFilesInActions,
    output: {
      dir: 'dist/actions',
      format: 'cjs',
    },
    plugins: basePlugins,
    external: [...baseExternal, 'axios'],
  },
  {
    input: tsFilesInActions,
    output: {
      dir: 'dist/actions',
      format: 'cjs',
    },
    plugins: [dts()],
  },
  {
    input: tsFilesInCommands,
    output: {
      dir: 'dist/commands',
      format: 'cjs',
    },
    plugins: basePlugins,
    external: baseExternal,
  },
  {
    input: tsFilesInCommands,
    output: {
      dir: 'dist/commands',
      format: 'cjs',
    },
    plugins: [dts()],
  },
  {
    input: tsFilesInBin,
    output: {
      dir: 'dist/bin',
      format: 'cjs',
    },
    plugins: [
      ...basePlugins,
      addShebang({
        include: 'dist/bin/builder.js',
      }),
    ],
    external: baseExternal,
  },
  {
    input: tsFilesInBin,
    output: {
      dir: 'dist/bin',
      format: 'cjs',
    },
    plugins: [dts()],
  },

  {
    input: tsFilesInCLI,
    output: {
      dir: 'dist/lib/CLI',
      format: 'cjs',
      preserveModules: true,
    },
    plugins: basePlugins,
    external: baseExternal,
  },
  {
    input: tsFilesInCLI,
    output: {
      dir: 'dist/lib/CLI',
      format: 'cjs',
      preserveModules: true,
    },
    plugins: [dts()],
  },

  {
    input: tsFilesInReaders,
    output: {
      dir: 'dist/lib/readers',
      format: 'cjs',
      preserveModules: true,
    },
    plugins: basePlugins,
    external: baseExternal,
  },
  {
    input: tsFilesInReaders,
    output: {
      dir: 'dist/lib/readers',
      format: 'cjs',
      preserveModules: true,
    },
    plugins: [dts()],
  },

  {
    input: tsFilesInSchematics,
    output: {
      dir: 'dist/lib/schematics',
      format: 'cjs',
      preserveModules: true,
    },
    plugins: basePlugins,
    external: baseExternal,
  },
  {
    input: tsFilesInSchematics,
    output: {
      dir: 'dist/lib/schematics',
      format: 'cjs',
      preserveModules: true,
    },
    plugins: [dts()],
  },

  {
    input: tsFilesInUI,
    output: {
      dir: 'dist/lib/ui',
      format: 'cjs',
      preserveModules: true,
    },
    plugins: basePlugins,
    external: baseExternal,
  },
  {
    input: tsFilesInUI,
    output: {
      dir: 'dist/lib/ui',
      format: 'cjs',
      preserveModules: true,
    },
    plugins: [dts()],
  },

  {
    input: tsFilesInUtils,
    output: {
      dir: 'dist/lib/utils',
      format: 'cjs',
      preserveModules: true,
    },
    plugins: basePlugins,
    external: baseExternal,
  },
  {
    input: tsFilesInUtils,
    output: {
      dir: 'dist/lib/utils',
      format: 'cjs',
      preserveModules: true,
    },
    plugins: [dts()],
  },
  {
    input: tsFilesInEnums,
    output: {
      dir: 'dist/enums',
      format: 'cjs',
    },
    plugins: basePlugins,
    external: baseExternal,
  },
  {
    input: tsFilesInEnums,
    output: {
      dir: 'dist/enums',
      format: 'cjs',
    },
    plugins: [dts()],
  },
  {
    input: tsFilesInInterfaces,
    output: {
      dir: 'dist/interfaces',
      format: 'cjs',
    },
    plugins: basePlugins,
    external: baseExternal,
  },
  {
    input: tsFilesInInterfaces,
    output: {
      dir: 'dist/interfaces',
      format: 'cjs',
    },
    plugins: [dts()],
  },
];
