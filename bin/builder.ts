#!/usr/bin/env node
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Command } from 'commander';
import { readFileSync } from 'fs';
import path from 'path';
import { CommandLoader } from '../commands';
import logo from './logo';

const bootstrap = async () => {
  console.log(logo);
  const program = new Command();

  program.configureHelp({
    sortSubcommands: true,
  });

  setVersionFlag(program);
  await CommandLoader.load(program);

  await program.parseAsync(process.argv);
};

function setVersionFlag(program: Command) {
  const packageJsonPath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  const version = packageJson.version;

  program.version(version, '-v, --version', 'Output the current version.');
  // program.parse(process.argv);
}

bootstrap();
