/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { existsSync } from 'fs';
import { dirname, join, resolve } from 'path';
import {
  JsonSchema,
  Schematic,
  SchematicCollection,
} from '../../actions/actions.interfaces';
import { SchematicDependency } from '../../interfaces/schema.interface';
import { checkCollection, uninstallCollection } from './collections';
import { colors } from './color';
import { findPackageJson } from './dependencies';
import { getPackageFile } from './file-finder';
import { logger } from './logger';
import { Spinner } from './spinner';

export async function installDependencies(
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

    if (isLocal) {
      spinner.info("It's a local collection");
    }

    const packagePath = getCollectionPath(collection, isLocal);

    const schemaJson = await getSchemaJson(packagePath, schematic, isLocal);

    if (schemaJson === undefined) {
      return [];
    }

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

export async function uninstallDependencies(
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
  packagePath: string,
  schematic: string,
  isLocal: boolean,
): Promise<JsonSchema> {
  let schemaPath: string;
  let collectionJson: SchematicCollection;

  if (isLocal) {
    collectionJson = require(packagePath);
    validateCollectionJson(collectionJson, schematic, packagePath);
    schemaPath = resolveSchemaPath(
      packagePath,
      collectionJson.schematics[schematic]?.schema,
    );
  } else {
    const packageJson = await getPackageFile(packagePath, 'package.json');
    if (!packageJson) {
      throw new Error(
        `Failed to fetch package.json for collection: ${packagePath}`,
      );
    }

    const schematicsPath: string = packageJson.schematics;
    if (!schematicsPath) {
      throw new Error(
        `No schematics path found in package.json for collection: ${packagePath}`,
      );
    }

    logger.info('collectionPath', [resolve(join(packagePath, schematicsPath))]);

    const collectionJson = await getPackageFile(schematicsPath);

    if (!collectionJson) {
      throw new Error(
        `No collection.json was found on the path: ${schematicsPath}`,
      );
    }

    const schematics = collectionJson.schematics;

    if (!schematics) {
      throw new Error(`No schematics were found on the collection.json`);
    }

    const schematicObj: Schematic = schematics[schematic];

    if (!schematicObj) {
      throw new Error(
        `The schematic ${schematic} was not found on the collection.json`,
      );
    }

    if (!schematicObj.schema) {
      return undefined;
    }

    schemaPath = schematicObj.schema;
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

async function loadSchemaJson(
  schemaPath: string,
  isLocal: boolean,
): Promise<JsonSchema | undefined> {
  if (isLocal) {
    if (!existsSync(schemaPath)) {
      throw new Error(`Failed to retrieve schema.json at path: ${schemaPath}`);
    }

    return require(schemaPath);
  } else {
    return await getPackageFile<JsonSchema>(schemaPath);
  }
}
