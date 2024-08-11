/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { existsSync } from 'fs';
import { access } from 'node:fs/promises';
import { dirname, join, resolve } from 'path';
import { Input } from '../commands';
import { SchematicDependency } from '../interfaces/schema.interface';
import { CLIFactory, SchematicsCli } from '../lib/CLI';
import { CLI } from '../lib/CLI/cli.enum';
import { Collection } from '../lib/schematics';
import {
  Spinner,
  checkCollection,
  colors,
  findInput,
  findPackageJson,
  getPackageFile,
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

    const dependencies = await installDependencies(
      collection,
      schematic as string,
      packageManager,
      dryRun,
    );

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
    await uninstallDependencies(dependencies, packageManager, dryRun);
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

async function installDependencies(
  collection: string,
  schematic: string,
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'cnpm' | 'bun',
  dryRun: boolean,
): Promise<[string, SchematicDependency][]> {
  const installedDependencies: [string, SchematicDependency][] = [];

  const spinner = new Spinner('Dependencies');
  spinner.start('Schematic dependencies');

  try {
    spinner.info('Validating is the collection is local');
    const isLocal = isLocalPath(collection);
    const collectionPath = getCollectionPath(collection, isLocal);
    const schemaJson = await getSchemaJson(collectionPath, schematic, isLocal);
    spinner.info('Getting schema json');

    const dependenciesConfig: { [packageName: string]: SchematicDependency } =
      schemaJson?.dependenciesConfig;

    if (
      dependenciesConfig === undefined ||
      Object.entries(dependenciesConfig).length === 0
    ) {
      logger.info('No dependencies found to install.');
      spinner.stop();

      return installedDependencies;
    }

    spinner.info('Validating dependecies');

    // Step 1: Validate Dependency Configurations
    for (const [packageName, config] of Object.entries(dependenciesConfig)) {
      spinner.info('Validating ' + packageName);

      // Step 2: Check Installation Status
      const packageJsonPath = await findPackageJson(process.cwd());

      if (packageJsonPath === false) {
        logger.error(`Package.json didn't find.`);
        spinner.stop();
        process.exit(1);
      }

      await checkCollection(
        packageName,
        process.cwd(),
        packageManager,
        dryRun,
        config.registry || 'https://registry.npmjs.org/',
        config.keepInstall,
      );

      installedDependencies.push([packageName, config]);
    }

    spinner.succeed(
      'All the dependencies were validated and installed if they needed',
    );

    return installedDependencies;
  } catch (error) {
    logger.error(error.message);
    spinner.stop();
    process.exit(1);
  }
}

function isLocalPath(collection: string): boolean {
  return collection.startsWith('./') || collection.startsWith('../');
}

function getCollectionPath(collection: string, isLocal: boolean): string {
  if (isLocal) {
    const resolvedPath = resolve(process.cwd(), collection);
    if (!existsSync(resolvedPath)) {
      throw new Error(`The collection path ${resolvedPath} does not exist.`);
    }

    return resolvedPath;
  } else {
    return collection;
  }
}

async function getSchemaJson(
  collectionPath: string,
  schematic: string,
  isLocal: boolean,
): Promise<any> {
  let schemaPath: string;
  let collectionJson: any;

  if (isLocal) {
    collectionJson = require(collectionPath);
    validateCollectionJson(collectionJson, schematic, collectionPath);
    schemaPath = resolveSchemaPath(
      collectionPath,
      collectionJson.schematics[schematic]?.schema,
    );
  } else {
    const packageJson = await getPackageFile(collectionPath, 'package.json');
    if (!packageJson) {
      throw new Error(
        `Failed to fetch package.json for collection: ${collectionPath}`,
      );
    }

    const schematicsPath = packageJson.schematics;
    if (!schematicsPath) {
      throw new Error(
        `No schematics path found in package.json for collection: ${collectionPath}`,
      );
    }

    schemaPath = 'schema.json';
  }

  return loadSchemaJson(schemaPath, isLocal);
}

function validateCollectionJson(
  collectionJson: any,
  schematic: string,
  collectionPath: string,
) {
  if (!collectionJson.schematics) {
    throw new Error(
      `The collection ${collectionPath} does not have schematics.`,
    );
  }

  if (!collectionJson.schematics[schematic]) {
    throw new Error(
      // eslint-disable-next-line max-len
      `The schematic ${schematic} is not found in the collection. Please execute the command: ${colors.bold(`builder info ${collectionPath}`)}`,
    );
  }
}

function resolveSchemaPath(collectionPath: string, schema: string): string {
  if (!schema) {
    throw new Error(`The schematic does not have a schema path.`);
  }
  const collectionDir = dirname(collectionPath);

  return resolve(collectionDir, schema.replace('./', ''));
}

function loadSchemaJson(schemaPath: string, isLocal: boolean): any {
  if (isLocal) {
    if (!existsSync(schemaPath)) {
      throw new Error(`Failed to retrieve schema.json at path: ${schemaPath}`);
    }

    return require(schemaPath);
  } else {
    return getPackageFile(schemaPath, 'schema.json');
  }
}

async function uninstallDependencies(
  dependencies: [string, SchematicDependency][],
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'cnpm' | 'bun',
  dryRun: boolean = false,
) {
  for (const [packageName, config] of dependencies) {
    try {
      await uninstallCollection(
        packageName,
        process.cwd(),
        packageManager,
        dryRun,
      );
    } catch (error) {
      logger.error(`Failed to uninstall temporal dependency: ${packageName}`);
      logger.error(error.message);
    }
  }
}
