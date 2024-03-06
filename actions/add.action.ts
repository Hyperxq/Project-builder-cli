/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/* eslint-disable import/no-extraneous-dependencies */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import npa from 'npm-package-arg';
import { json } from 'npm-registry-fetch';
import { Input } from '../commands';
import { packageManagerCommands } from '../enums/package-manager.enum';
import { CLI } from '../interfaces/template.interface';
import { CLIFactory, SchematicsCli } from '../lib/CLI';
import {
  Spinner,
  colors,
  findInput,
  findPackageJson,
  isDependencyInstalled,
  logger,
  spawnAsync,
} from '../lib/utils';
import { SchematicsCollectionSchema } from './../interfaces/schema.interface';
import { AbstractAction } from './abstract.action';

export class AddAction extends AbstractAction {
  public async handle(inputs: Input[], flags: Input[]) {
    await addSchematic(inputs, flags);
  }
}

const addSchematic = async (inputs: Input[] = [], flags: Input[] = []) => {
  try {
    /*
     * 1. Check the library
     * 2. Install library on dev by default
     * 3. Check if builder-add or ng-add exist.
     * 4. Execute builder-add or ng-add schematic.
     */

    const collectionName = findInput(inputs, 'collection-name')
      ?.value as string;
    const registry = findInput(flags, 'registry')?.value as string;
    const saveDev = findInput(flags, 'save-dev')?.value as boolean;
    const dryRun = findInput(flags, 'dry-run')?.value as boolean;
    const packageManager = findInput(flags, 'package-manager')?.value as
      | 'npm'
      | 'yarn'
      | 'pnpm'
      | 'cnpm'
      | 'bun';

    await isPackageValid(collectionName, registry);
    if (!(await isItInstalled(collectionName))) {
      // Install library on dev by default
      if (!dryRun) {
        await spawnAsync(
          packageManager,
          [
            packageManagerCommands[packageManager],
            collectionName,
            saveDev ? '--save-dev' : '',
            registry ? `--registry=${registry}` : '',
          ],
          {
            cwd: process.cwd(),
            stdio: 'inherit',
            shell: true,
          },
        );
        logger.info(`Collection ${collectionName} installed!`);
      }
    } else {
      logger.warn(`The collection is already installed`);
      process.exit(1);
    }
    const { name } = npa(collectionName);
    const collection: SchematicsCollectionSchema = !dryRun
      ? findAndReadCollectionJson(name)
      : { schematics: {} };

    if (
      collection.schematics &&
      (collection.schematics['builder-add'] || collection.schematics['ng-add'])
    ) {
      try {
        let addSchematicName = '';
        if (collection.schematics['ng-add'] !== undefined) {
          addSchematicName = 'ng-add';
        }
        if (
          collection.schematics['ng-add'] === undefined &&
          collection.schematics['builder-add']
        ) {
          addSchematicName = 'builder-add';
        }
        const schematicCli = CLIFactory() as SchematicsCli;

        await schematicCli.runCommand(
          schematicCli.getExecuteCommand(
            name,
            addSchematicName,
            [],
            dryRun ? [{ name: 'save-mode', value: dryRun }] : [],
          ),
        );

        logger.info(
          `The schematic ${addSchematicName} was executed successfully`,
        );
      } catch (error) {
        logger.error(
          `Something happen when executing the schematic ng-add or builder-add: ${error.message}`,
        );
      }
    }
    logger.info(`The collection ${collectionName} was added successfully`);
  } catch (error) {
    logger.error(error.message, [error.code]);
    process.exit(1);
  }
};

async function isPackageValid(
  collection: string,
  registry: string,
): Promise<void> {
  const spinner = new Spinner('collection');
  try {
    if (!checkCollectionNameFormat(collection)) {
      logger.error(`Invalid collection name: "${collection}". Valid collection names must follow one of these formats:
      - "package-name" for unscoped packages,
      - "@scope/package-name" for scoped packages,
      - "package-name@version" to specify a version, or
      - "@scope/package-name@version" for scoped packages with a version.

      Please ensure your collection name only contains
      alphanumeric characters, hyphens, underscores, and optionally, a semantic version (e.g., "1.0.0", "2.1.3").
      Check the documentation for more details.`);

      process.exit(1);
    }
    const { name, rawSpec } = npa(collection);
    spinner.start('Determining package manager...');
    const response = await json(
      `/${name}${rawSpec && rawSpec !== '*' ? `/${rawSpec}` : ''}`,
      {
        registry,
      },
    );
    const latestVersion: string = response['dist-tags']
      ? response['dist-tags']['latest']
      : '';
    spinner.succeed(
      `Found compatible package:  ${colors.grey(`${name}@${rawSpec && rawSpec !== '*' ? `/${rawSpec}` : '' ?? latestVersion}`)}.`,
    );

    return;
  } catch (error) {
    spinner.stop();
    logger.error(
      `Unable to load package information from registry: ${error.message}`,
    );
    process.exit(1);
  }
}

async function isItInstalled(collection: string) {
  const packageJSON = await findPackageJson(process.cwd());

  if (!packageJSON) {
    process.exit(1);
  }

  return await isDependencyInstalled(collection, process.cwd());
}

function checkCollectionNameFormat(collectionName) {
  // This regex matches:
  // - Optional scoped package names (@user/package-name)
  // - Package names (package-name)
  // - Optional version after the package name (@version), where version can be a semver version
  const regex = /^(?:@[\w-]+\/)?[\w-]+(?:@[0-9]+(?:\.[0-9]+)*(?:\.[0-9]+)*)?$/;

  return regex.test(collectionName);
}

function findAndReadCollectionJson(packageName: string) {
  const packageJsonPath = join(
    process.cwd(),
    'node_modules',
    packageName,
    'package.json',
  );

  try {
    // Read the library's package.json to find the schematics entry point
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    if (!packageJson.schematics) {
      logger.error(
        `The package '${packageName}' does not specify a 'schematics' field in its package.json.`,
      );
      process.exit(1);
    }

    // Resolve the path to collection.json using the schematics field
    const collectionPath = join(
      process.cwd(),
      'node_modules',
      packageName,
      packageJson.schematics,
    );

    // Now you have the collection object, you can process it as needed
    return JSON.parse(readFileSync(collectionPath, 'utf8'));
  } catch (error) {
    logger.error(
      `Failed to read the schematics collection for '${packageName}': ${error.message}`,
    );
    process.exit(1);
  }
}
