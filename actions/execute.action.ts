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
  checkCollection,
  findInput,
  logger,
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
    const sendPM = findInput(flags, 'send-pm')?.value as boolean;
    const dryRun = findInput(flags, 'dry-run')?.value as boolean;
    const registry = findInput(flags, 'registry')?.value as string;
    const packageManager = findInput(flags, 'package-manager')?.value as
      | 'npm'
      | 'yarn'
      | 'pnpm'
      | 'cnpm'
      | 'bun';

    const regex = /^(@?[^@]+)(?:@([^@]+))?$/gs;
    const match = collectionInput.match(regex);

    const collection = match[0] ?? Collection.ANGULAR;

    const isAlreadyInstalled = await checkCollection(
      collectionInput,
      process.cwd(),
      packageManager,
      dryRun,
      registry,
    );

    const flagsFilted = sendPM
      ? flags.filter(({ name }) => name !== 'send-pm')
      : flags.filter(
          ({ name }) => name !== 'send-pm' && name !== 'package-manager',
        );
    const schematicCli = CLIFactory(CLI.SCHEMATICS) as SchematicsCli;
    logger.debug('flagsFilted', [
      schematicCli.getExecuteCommand(collection, schematic, [], flagsFilted),
    ]);

    await schematicCli.runCommand(
      schematicCli.getExecuteCommand(collection, schematic, [], flagsFilted),
    );

    if (!isAlreadyInstalled) {
      await uninstallCollection(
        collectionInput,
        process.cwd(),
        packageManager,
        dryRun,
      );
    }
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
};
