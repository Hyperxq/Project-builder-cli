/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { access } from 'node:fs/promises';
import { Input } from '../commands';
import { CLIFactory, SchematicsCli } from '../lib/CLI';
import { CLI } from '../lib/CLI/cli.enum';
import { Collection } from '../lib/schematics';
import {
  checkCollection,
  findInput,
  findPackageJson,
  isDependencyInstalled,
  logger,
  spawnAsync,
  uninstallCollection,
} from '../lib/utils';
import { AbstractAction } from './abstract.action';

export class ExecuteAction extends AbstractAction {
  public async handle(inputs: Input[], flags: Input[]) {
    await executeSchematic(inputs, flags);
  }
}

const executeSchematic = async (inputs: Input[] = [], flags: Input[] = []) => {
  try {
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
