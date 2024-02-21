/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Input } from '../commands';
import { CLIFactory, SchematicsCli } from '../lib/CLI';
import { CLI } from '../lib/CLI/cli.enum';
import { Collection } from '../lib/schematics';
import {
  findInput,
  isDependencyInstalled,
  logger,
  spawnAsync,
} from '../lib/utils';
import { AbstractAction } from './abstract.action';

export class ExecuteAction extends AbstractAction {
  public async handle(inputs: Input[], flags: Input[]) {
    await executeSchematic(inputs, flags);
  }
}

const executeSchematic = async (inputs: Input[] = [], flags: Input[] = []) => {
  try {
    // TODO: add winston

    const collectionInput = findInput(inputs, 'collection')?.value as string;
    const schematic = findInput(inputs, 'schematic')?.value as string;

    const regex = /^(@?[^@]+)(?:@([^@]+))?$/gs;
    const match = collectionInput.match(regex);

    const collection = match[0] ?? Collection.ANGULAR;

    const isAlreadyInstalled = await checkCollection(collectionInput);

    const schematicCli = CLIFactory(CLI.SCHEMATICS) as SchematicsCli;

    await schematicCli.runCommand(
      schematicCli.getExecuteCommand(collection, schematic, [], flags),
    );

    if (!isAlreadyInstalled) {
      await uninstallCollection(collectionInput);
    }
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
};

async function checkCollection(collection: string): Promise<boolean> {
  try {
    const isInstalled = await isDependencyInstalled(collection);

    if (!isInstalled) {
      logger.info('Temporal installation package: ' + collection, [
        'command executed: ' + 'npm install ' + collection,
      ]);

      await spawnAsync('npm', ['install', collection], {
        cwd: process.cwd(),
        stdio: 'inherit',
        shell: true,
      });

      // spawnSync('npm', ['install', collection], { stdio: 'ignore' });
      return isInstalled;
    }
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
}

async function uninstallCollection(collection: string) {
  try {
    logger.info('Uninstalling of temporal package: ' + collection, [
      'command executed: ' + 'npm uninstall ' + collection,
    ]);
    // spawnSync('npm', ['uninstall', collection], { stdio: 'ignore' });
    await spawnAsync('npm', ['uninstall', collection], {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: true,
    });
    // spawnSync('npm', ['uninstall', collection], { stdio: 'inherit' });
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
}
