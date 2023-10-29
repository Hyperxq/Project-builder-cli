import swc from 'rollup-plugin-swc3';
import copy from 'rollup-plugin-copy';
import addShebang from 'rollup-plugin-add-shebang';
import resolve from '@rollup/plugin-node-resolve';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';

export default [
  {
    input: {
      abstract: 'actions/abstract.action.ts',
      create: 'actions/create.action.ts',
      generate: 'actions/generate.action.ts',
      index: 'commands/index.ts',
    },
    output: {
      dir: 'dist/actions',
      format: 'es',
    },
    plugins: [
      swc({
        configFile: '.swcrc',
      }),
      resolve({
        preferBuiltins: true,
      }),
      builtins(),
      globals(),
    ],
    external: [
      'commander',
      'ansi-colors',
      'tty',
      'node-emoji',
      'fs',
      'path',
      'child_process',
      'node:module',
    ],
  },
  {
    input: {
      abstract: 'commands/abstract.command.ts',
      create: 'commands/create.command.ts',
      generate: 'commands/generate.command.ts',
      loader: 'commands/command.loader.ts',
      input: 'commands/command.input.ts',
      index: 'commands/index.ts',
    },
    output: {
      dir: 'dist/commands',
      format: 'es',
    },
    plugins: [
      swc({
        configFile: '.swcrc',
      }),
      resolve({
        preferBuiltins: true,
      }),
      builtins(),
      globals(),
    ],
    external: [
      'commander',
      'ansi-colors',
      'tty',
      'node-emoji',
      'fs',
      'path',
      'node-emoji',
      'child_process',
      'node:module',
    ],
  },
  {
    input: 'bin/builder.ts',
    output: {
      dir: 'dist/bin',
      format: 'es',
    },
    plugins: [
      swc({
        configFile: '.swcrc',
      }),
      addShebang({
        include: 'dist/bin/builder.js',
      }),
      resolve({
        preferBuiltins: true,
      }),
      builtins(),
      globals(),
    ],
    external: [
      'commander',
      'fs',
      'url',
      'path',
      'ansi-colors',
      'tty',
      'node-emoji',
      'child_process',
      'node:module',
    ],
  },
  {
    input: 'src/index.ts', // Replace with the entry point of your CLI
    output: [
      {
        dir: 'dist/lib',
        format: 'es',
      },
    ],
    plugins: [
      swc({
        configFile: '.swcrc',
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
      resolve({
        preferBuiltins: true,
      }),
      builtins(),
      globals(),
    ],
  },
];
