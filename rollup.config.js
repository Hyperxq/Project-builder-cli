import copy from 'rollup-plugin-copy';
import addShebang from 'rollup-plugin-add-shebang';
import resolve from '@rollup/plugin-node-resolve';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: {
      'abstract.action': 'actions/abstract.action.ts',
      'create.action': 'actions/create.action.ts',
      'generate.action': 'actions/generate.action.ts',
      'execute.action': 'actions/execute.action.ts',
      'actions.interfaces': 'actions/actions.interfaces.ts',
      index: 'actions/index.ts',
    },
    output: {
      dir: 'dist/actions',
      format: 'cjs',
    },
    plugins: [
      typescript({ outputToFilesystem: false }), // Convert TypeScript to JavaScript
      commonjs(), // Convert CommonJS modules to ES6
      resolve(), // Locate and use modules in node_modules
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
      '@angular/cli',
      '@nestjs/cli',
      '@angular-devkit/schematics-cli',
      'axios',
    ],
  },
  {
    input: {
      'abstract.command': 'commands/abstract.command.ts',
      'create.command': 'commands/create.command.ts',
      'generate.command': 'commands/generate.command.ts',
      'command.loader': 'commands/command.loader.ts',
      'command.input': 'commands/command.input.ts',
      index: 'commands/index.ts',
    },
    output: {
      dir: 'dist/commands',
      format: 'cjs',
    },
    plugins: [
      typescript({ outputToFilesystem: false }), // Convert TypeScript to JavaScript
      commonjs(), // Convert CommonJS modules to ES6
      resolve(), // Locate and use modules in node_modules
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
      '@angular/cli',
      '@nestjs/cli',
      '@angular-devkit/schematics-cli',
    ],
  },
  {
    input: 'bin/builder.ts',
    output: {
      dir: 'dist/bin',
      format: 'cjs',
    },
    plugins: [
      typescript(), // Convert TypeScript to JavaScript
      commonjs(), // Convert CommonJS modules to ES6
      resolve(), // Locate and use modules in node_modules
      addShebang({
        include: 'dist/bin/builder.js',
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
      '@angular/cli',
      '@nestjs/cli',
      '@angular-devkit/schematics-cli',
    ],
  },
  {
    input: 'src/index.ts', // Replace with the entry point of your CLI
    output: [
      {
        dir: 'dist/lib',
        format: 'cjs',
      },
    ],
    plugins: [
      typescript(), // Convert TypeScript to JavaScript
      commonjs(), // Convert CommonJS modules to ES6
      resolve(), // Locate and use modules in node_modules
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
      builtins(),
      globals(),
    ],
  },
  {
    input: {
      index: 'lib/utils/index.ts',
      color: 'lib/utils/color.ts',
      formatting: 'lib/utils/formatting.ts',
    },
    output: {
      dir: 'dist/lib/utils',
      format: 'cjs',
    },

    external: ['node-emoji', 'path'],
    plugins: [
      typescript(), // Convert TypeScript to JavaScript
      commonjs(), // Convert CommonJS modules to ES6
      resolve(), // Locate and use modules in node_modules
    ],
  },
  {
    input: {
      emojis: 'lib/ui/emojis.ts',
      index: 'lib/ui/index.ts',
      messages: 'lib/ui/messages.ts',
      prefixes: 'lib/ui/prefixes.ts',
    },
    output: {
      dir: 'dist/lib/ui',
      format: 'cjs',
    },
    plugins: [
      typescript(), // Convert TypeScript to JavaScript
      commonjs(), // Convert CommonJS modules to ES6
      resolve(), // Locate and use modules in node_modules
      builtins(),
      globals(),
    ],
    external: ['node-emoji'],
  },
  {
    input: {
      index: 'lib/CLI/index.ts',
      'abstract.cli': 'lib/CLI/abstract.cli.ts',
      'angular.cli': 'lib/CLI/angular.cli.ts',
      'nestjs.cli': 'lib/CLI/nestjs.cli.ts',
      'schematics.cli': 'lib/CLI/schematics.cli.ts',
      'cli.enum': 'lib/CLI/cli.enum.ts',
      'cli.interfaces': 'lib/CLI/cli.interfaces.ts',
      'cli.factory': 'lib/CLI/cli.factory.ts',
    },
    output: {
      dir: 'dist/lib/CLI',
      format: 'cjs',
    },
    plugins: [typescript(), commonjs(), resolve(), builtins(), globals()],
    external: [
      'child_process',
      '@angular/cli',
      '@nestjs/cli',
      '@angular-devkit/schematics-cli',
    ],
  },
  {
    input: {
      index: 'lib/readers/index.ts',
      reader: 'lib/readers/reader.ts',
    },
    output: {
      dir: 'dist/lib/readers',
      format: 'cjs',
    },
    plugins: [
      typescript(), // Convert TypeScript to JavaScript
      commonjs(), // Convert CommonJS modules to ES6
    ],
    external: ['node-emoji'],
  },
  {
    input: {
      'angular-configuration':
        'lib/configuration/angular-configuration.loader.ts',
      index: 'lib/configuration/index.ts',
      'configuration.loader': 'lib/configuration/configuration.loader.ts',
      'nest-configuration.loader':
        'lib/configuration/nest-configuration.loader.ts',
    },
    output: {
      dir: 'dist/lib/configuration',
      format: 'cjs',
    },
    plugins: [
      typescript(), // Convert TypeScript to JavaScript
      commonjs(), // Convert CommonJS modules to ES6
      resolve(), // Locate and use modules in node_modules
      builtins(),
      globals(),
    ],
    external: ['node-emoji'],
  },
  {
    input: {
      'abstract.runner': 'lib/runners/abstract.runner.ts',
      index: 'lib/runners/index.ts',
      'angular.runner': 'lib/runners/angular.runner.ts',
      'npm.runner': 'lib/runners/npm.runner.ts',
      'pnpm.runner': 'lib/runners/pnpm.runner.ts',
      'schematic.runner': 'lib/runners/schematic.runner.ts',
      'yarn.runner': 'lib/runners/yarn.runner.ts',
    },
    output: {
      dir: 'dist/lib/configuration',
      format: 'cjs',
    },
    plugins: [
      typescript(), // Convert TypeScript to JavaScript
      commonjs(), // Convert CommonJS modules to ES6
      resolve(), // Locate and use modules in node_modules
      builtins(),
      globals(),
    ],
    external: ['node-emoji'],
  },
];
