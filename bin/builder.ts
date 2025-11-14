#!/usr/bin/env node

import chalk from 'chalk';
import { Command, program } from 'commander';
import { readFileSync } from 'fs';
import path from 'path';
import { CommandLoader } from '../lib/commands';
import { logger } from '../lib/utils';
import logo from './logo';

const minNodeVersion = 22;

const bootstrap = async () => {
  console.log(logo);

  checkNodeVersion();

  program.configureHelp({
    sortSubcommands: true,
  });

  setVersionFlag(program);
  await CommandLoader.load(program);

  program.helpInformation = addColorsToHelp;
  program.parse(process.argv);
};

function addColorsToHelp() {
  // Start with your custom header
  const header = `${chalk.bold.green('🚀  Welcome to Project Builder CLI')}\n`;
  // Use the original help output and color it
  const base = Command.prototype.helpInformation.call(this);
  // You can color parts by regex or string replace
  const colored = base
    .replace(/^Usage:/m, chalk.cyanBright.bold('Usage:'))
    .replace(/^Options:/m, chalk.cyanBright.bold('Options:'))
    .replace(/^Commands:/m, chalk.cyanBright.bold('Commands:'));

  return `${header}\n${colored}`;
}

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
