#!/usr/bin/env node
import {Command} from 'commander';
import path from 'path';
import {readFileSync} from 'fs';
// import {fileURLToPath} from "url";
import {CommandLoader} from '../commands';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const bootstrap = async () => {
  const program = new Command();

  program.configureHelp({
    sortSubcommands: true,
  });

  setVersionFlag(program);
  await CommandLoader.load(program);

  await program.parseAsync(process.argv);
};

function setCreateCommand() {}

function setVersionFlag(program: Command) {
  const packageJsonPath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  const version = packageJson.version;

  program.version(version, '-v, --version', 'Output the current version.');
  // program.parse(process.argv);
}

bootstrap();
