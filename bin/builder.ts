#!/usr/bin/env node
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Command, program } from 'commander';
import { readFileSync } from 'fs';
import path from 'path';
import { CommandLoader } from '../commands';
import { logger } from '../lib/utils';
import logo from './logo';

const minNodeVersion = 20;

const bootstrap = async () => {
  console.log(logo);

  checkNodeVersion();

  program.configureHelp({
    sortSubcommands: true,
  });

  setVersionFlag(program);
  await CommandLoader.load(program);

  program.parse(process.argv);
};

function setVersionFlag(program: Command) {
  const packageJsonPath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  const version = packageJson.version;

  program.version(version, '-v, --version', 'Output the current version.');
  // program.parse(process.argv);
}

function checkNodeVersion() {
  // Extract the major version number
  const nodeVersion = process.version;
  const currentMajorVersion = parseInt(
    nodeVersion.split('.')[0].substring(1),
    10,
  );

  // Compare with the minimum required version
  if (minNodeVersion > currentMajorVersion) {
    logger.error(
      `Current Node.js version is ${nodeVersion}. This application requires Node.js v${minNodeVersion} or higher.`,
    );
    process.exit(1); // Exit with an error code
  }
}

bootstrap();
