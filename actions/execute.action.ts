/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { access } from 'node:fs/promises';
import { Input } from '../commands';
import { SchematicDependency } from '../interfaces/schema.interface';
import { CLIFactory, SchematicsCli } from '../lib/CLI';
import { CLI } from '../lib/CLI/cli.enum';
import { Collection } from '../lib/schematics';
import {
  checkCollection,
  findInput,
  installDependencies,
  logger,
  uninstallCollection,
  uninstallDependencies,
} from '../lib/utils';
import { AbstractAction } from './abstract.action';

export class ExecuteAction extends AbstractAction {
  public async handle(inputs: Input[], flags: Input[]) {
    await executeSchematic(inputs, flags);
  }
}

const executeSchematic = async (inputs: Input[] = [], flags: Input[] = []) => {
  try {
    // Use case when executing schematics
    // 1. Not Dependencies , Schematic remote installed.
    // 2. Not dependencies, Not Schematic remote installed.
    // 3. Not Dependencies , Schematic Local.
    // 4. Dependencies, Not Dependencies installed, Not installed.
    // 5. Dependencies, Dependencies installed, Not installed.
    // 6. Dependencies, Dependencies installed, installed.
    // 7. Dependencies remote, schematic local.
    // 8. Dependencies local, schematic local.
    // 9. Dependencies local, schematic remote.
    // 10. Dependencies mix(local/remote), schematic remote.
    // 11. Not Dependencies, schematic with registry.
    // 12. Dependencies with sub-dependencies, installed.

    const collectionInput = findInputValue(inputs, 'collection') as string;
    const keepInstalled = findInputValue(flags, 'keep-installed') as boolean;
    const schematic = findInputValue(inputs, 'schematic');
    const sendPM = findInputValue(flags, 'send-pm') as boolean;
    const sendRegistry = findInputValue(flags, 'send-registry') as boolean;
    const dryRun = findInputValue(flags, 'dry-run') as boolean;
    const registry = findInputValue(flags, 'registry') as string;
    const packageManager = findInputValue(flags, 'package-manager') as
      | 'npm'
      | 'yarn'
      | 'pnpm'
      | 'cnpm'
      | 'bun';

    const collection = extractCollectionName(collectionInput);

    const localCollection: boolean = isLocalCollection(collectionInput);

    if (localCollection) {
      validatePath(collectionInput);
    }

    const needsUninstall = await determineUninstall(
      collectionInput as string,
      localCollection,
      packageManager,
      dryRun,
      registry,
      keepInstalled,
    );

    // const dependencies = await installDependencies(
    //   collection,
    //   schematic as string,
    //   packageManager,
    //   dryRun,
    // );

    const filteredFlags = filterFlags(flags, {
      sendPM,
      sendRegistry,
      registry: registry as string,
    });

    const schematicCli = CLIFactory(CLI.SCHEMATICS) as SchematicsCli;
    await schematicCli.runCommand(
      schematicCli.getExecuteCommand(
        collection,
        schematic as string,
        [],
        filteredFlags,
      ),
    );

    if (needsUninstall && !keepInstalled && !localCollection) {
      await uninstallCollection(
        collectionInput as string,
        process.cwd(),
        packageManager,
        dryRun,
      );
    }
    // await uninstallDependencies(dependencies, packageManager, dryRun);
  } catch (error) {
    handleExecutionError(error);
  }
};

const findInputValue = (
  inputs: Input[],
  name: string,
): string | boolean | undefined => {
  return findInput(inputs, name)?.value;
};

const extractCollectionName = (collectionInput: string): string => {
  const match = collectionInput.match(/^(@?[^@]+)(?:@([^@]+))?$/);

  return match?.[0] ?? Collection.ANGULAR;
};

const isLocalCollection = (collectionInput: string): boolean => {
  return collectionInput.startsWith('./') || collectionInput.startsWith('../');
};

const determineUninstall = async (
  collectionInput: string,
  localCollection: boolean,
  packageManager?: string,
  dryRun?: boolean,
  registry?: string,
  keepInstalled?: boolean,
): Promise<boolean> => {
  if (localCollection) {
    return false;
  }

  return !(await checkCollection(
    collectionInput,
    process.cwd(),
    packageManager,
    dryRun,
    registry,
    keepInstalled,
  ));
};

const filterFlags = (
  flags: Input[],
  options: { sendPM?: boolean; sendRegistry?: boolean; registry?: string },
): Input[] => {
  return flags.filter(({ name }) => {
    if (name === 'send-pm' && options.sendPM) {
      return false;
    }
    if (['send-pm', 'package-manager'].includes(name)) {
      return false;
    }
    if (name === 'send-registry' && options.sendRegistry) {
      return false;
    }
    if (['send-registry', 'registry', 'keep-installed'].includes(name)) {
      return false;
    }

    return true;
  });
};

const handleExecutionError = (error: any) => {
  if (error?.message) {
    logger.error(error.message);
  }
  process.exit(1);
};

async function validatePath(filePath: string) {
  try {
    await access(filePath);
  } catch (error) {
    logger.error(
      `The collection path:${filePath} doesn't exist, please check this path if it rigth`,
    );
    process.exit(1);
  }
}
