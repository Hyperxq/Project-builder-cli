/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { Input } from '../commands';
import { colors, findInput, getPackageFile, logger } from '../lib/utils';
import {
  JsonSchema,
  Properties,
  Schematic,
  SchematicCollection,
  Schematics,
} from './actions.interfaces';
import { AbstractAction } from './';

export class InfoAction extends AbstractAction {
  public async handle(inputs: Input[], flags: Input[]) {
    await showInfo(inputs, flags);
  }
}

const showInfo = async (inputs: Input[] = [], flags: Input[] = []) => {
  logger.warn(
    'This command will first search for the package locally and then search in:  https://unpkg.com/',
  );

  const collectionName = findInput(inputs, 'collection-name')?.value as string;
  let schematicName = findInput(inputs, 'schematic-name')?.value as string;

  let collection: SchematicCollection;
  let collectionPath: string;

  // Step 1: Check if the collectionName is a local path
  if (collectionName.startsWith('./') || collectionName.startsWith('../')) {
    collectionPath = join(process.cwd(), collectionName);

    if (!existsSync(collectionPath)) {
      logger.error(
        `The local path ${collectionPath} does not exist or is not accessible.`,
      );
      process.exit(1);
    }

    // Step 1.2: Get the collection.json directly from the local path
    collection = require(collectionPath);
  } else {
    // Step 2: Get the package.json using the file-finder utility
    const packageJson = await getPackageFile(collectionName, 'package.json');

    if (packageJson === undefined) {
      logger.error(`We didn't find any package or path: ${collectionName}`);
      process.exit(1);
    }

    collectionPath = packageJson?.schematics;

    if (!collectionPath) {
      logger.error(
        `This package doesn't have a schematic path in the package.json`,
      );
      process.exit(1);
    }

    // Step 3: Get the collection.json using the file-finder utility
    collection = await getPackageFile(
      collectionName,
      collectionPath.replaceAll('./', ''),
    );
  }

  const schematics = collection?.schematics;

  if (!schematics) {
    logger.error(`This collection doesn't have any schematics declared`);
    process.exit(1);
  }

  if (schematicName) {
    let schematic: Schematic = schematics[schematicName];

    if (!schematic) {
      schematic = findSchematicByAlias(schematics, schematicName);
      if (schematic) {
        schematicName = schematic.schematicName;
      }
    }

    if (!schematic) {
      logger.error(
        `The schematic: ${colors.bold(schematicName)} is not declared in the collection`,
      );
      process.exit(1);
    }

    const schemaPath = schematic?.schema;

    if (!schemaPath) {
      logger.info(`The schematic: ${schematicName} doesn't have any options.`);
      process.exit(1);
    }

    let cPath: string;

    let packagePath = collectionName;
    // Handle the schema path based on whether the collection is local or remote
    if (!collectionName.startsWith('./') && !collectionName.startsWith('../')) {
      // Remote collection: construct the path as before
      cPath = collectionPath
        .split('/')
        .filter((x) => x !== '.' && x !== 'collection.json')
        .join('/');
    } else {
      packagePath = collectionName
        .split('/')
        .filter((x) => x !== 'collection.json')
        .join('/');
    }

    const fullSchemaPath = `${cPath ? cPath + '/' : ''}${schemaPath.replaceAll('./', '')}`;

    // Step 4: Get the schema.json using the file-finder utility
    const schema: JsonSchema = await getPackageFile(
      packagePath,
      fullSchemaPath,
    );

    if (Object.values(schema?.properties ?? {}).length === 0) {
      logger.info(
        `The schematic: ${colors.bold(schematicName)} doesn't have any options.`,
      );
      process.exit(1);
    }

    console.log(
      colors.blue(`
${colors.bold('Schematic:')} ${schematicName}
${colors.bold('Description:')} ${schematic.description}
${schematic.aliases ? `${colors.bold('Alias: ')} ${schematic.aliases}\n` : ''}${getSchemaOptions(schema.properties)}
`),
    );
  } else {
    const schematicEntries = Object.entries(schematics).filter(
      ([name, options]) =>
        name !== 'builder-add' && name !== 'ng-add' && !options?.hidden,
    );

    if (schematicEntries.length > 0) {
      console.log(
        colors.blue(
          `List of schematics for ${colors.bold(collectionName)}:
  ${schematicEntries
    .map(([schematic]) => {
      const aliases = schematics[schematic]?.aliases;

      // eslint-disable-next-line max-len
      return `    - builder exec ${collectionName} ${colors.bold(schematic)} ${aliases ? `(aliases: ${aliases.join(', ')})` : ''} [options]`;
    })
    .join('\n')}`,
        ),
      );

      logger.info(
        'To see all the options for any of these schematics use this command: builder info <collection-name> <schematic-name>',
      );
    } else {
      console.log(
        colors.yellow(
          `This collection ${collectionName} doesn't have any schematic.`,
        ),
      );
    }
  }
};

function findSchematicByAlias(
  schematics: Schematics,
  alias: string,
): Schematic | undefined {
  const [schematicName, schematic] =
    Object.entries(schematics).find(([schematicName, schematic]) =>
      (schematic?.aliases ?? []).some((x) => x === alias),
    ) ?? [];

  const response = schematic ? schematics[schematicName] : undefined;
  if (response) {
    response.schematicName = schematicName;
  }

  return response;
}

function getSchemaOptions(properties: Properties): string {
  return `${colors.bold('Options: ')}
${Object.entries(properties)
  .filter(([, options]) => !options?.visible)
  .map(
    ([name, options]) =>
      // eslint-disable-next-line max-len
      `    - ${colors.bold(name)}: type: ${options.type}${options.default ? `, default: ${options.default}` : ''}${options['enum'] ? `, possible values: ${(options['enum'] as string[]).join(' | ')}` : ''}`,
  )
  .join('\n')}
`;
}
