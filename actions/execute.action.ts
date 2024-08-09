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
  colors,
  findInput,
  logger,
  uninstallCollection,
} from '../lib/utils';
import { AbstractAction } from './abstract.action';
import {
  JsonSchema,
  Schematic,
  SchematicCollection,
} from './actions.interfaces';

export class ExecuteAction extends AbstractAction {
  public async handle(inputs: Input[], flags: Input[]) {
    await executeSchematic(inputs, flags);
  }
}

const executeSchematic = async (inputs: Input[] = [], flags: Input[] = []) => {
  try {
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

    await installDependencies(collection, schematic as string);

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

    await uninstallDependencies();
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

function installDependencies(collectionName: string, schematicName: string) {
  /*
   * 1. Get the schema.json.
   * 2. Validate all the dependencies.
   * 3. Install them temporally.
   * 4. After everything remove them.
   */

  /*
   * Get the schema.json
   * 1. Read the package.json remote (only with https://unpkg.com) or local (install in the project or global).
   * 2. Get collection path.
   * 3. Read Collection file.
   * 3. Get schematics info.
   * 4. Get the schematic that you want to read.
   * 5. Get schema.json path.
   * 6. Read schema.json.
   */

  const packageJson = JSON.parse(
    JSON.stringify(require.resolve(`${collectionName}/package.json`)),
  );

  const collectionPath: string | undefined = packageJson?.schematics;

  if (!collectionPath) {
    logger.error(
      `This package doesn't have a schematic path into the package.json`,
    );
    process.exit(1);
  }

  const collection: SchematicCollection = JSON.parse(
    JSON.stringify(
      JSON.stringify(
        require.resolve(
          `${collectionName}/${collectionPath.replaceAll('./', '')}`,
        ),
      ),
    ),
  );

  const schematics = collection?.schematics;

  if (!schematics) {
    logger.error(`This collection doesn't have any schematic declared`);
    process.exit(1);
  }

  if (schematicName) {
    const schematic: Schematic = schematics[schematicName];

    if (!schematic) {
      logger.error(
        `The schematic: ${colors.bold(schematicName)} is not declared in the collection`,
      );
      process.exit(1);
    }

    const schemaPath = schematic?.schema;

    if (!schemaPath) {
      logger.info(`The schematic: ${schematicName} doesn't have any option.`);
      process.exit(1);
    }

    const cPath = collectionPath
      .split('/')
      .filter((x) => x !== '.' && x !== 'collection.json')
      .join('/');

    const schema: JsonSchema = JSON.parse(
      JSON.stringify(
        require.resolve(
          `${collectionName}${cPath ? '/' + cPath : ''}/${schemaPath.replaceAll('./', '')}`,
        ),
      ),
    );

    if (!schema.properties) {
      logger.info(`The schematic: ${schematicName} doesn't have any option.`);
      process.exit(1);
    }
  }
}

function uninstallDependencies(dependecies: SchematicDependency[] = []) {}
