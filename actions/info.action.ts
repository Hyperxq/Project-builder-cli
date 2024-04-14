/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { schematic } from '@angular-devkit/schematics';
import { Input } from '../commands';
import { colors, fetchData, findInput, logger } from '../lib/utils';
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
  /*
   * 1.1 Get the package.json.
   * 1.2 Get the collection.json path.
   * 2.1 Get the collection.json.
   * 2.2 Get the schema path.
   * 3. Get the schematics options.
   */
  const collectionName = findInput(inputs, 'collection-name')?.value as string;
  let schematicName = findInput(inputs, 'schematic-name')?.value as string;

  const packageJson = JSON.parse(
    JSON.stringify(
      await fetchData(`https://unpkg.com/${collectionName}/package.json`),
    ),
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
      await fetchData(
        `https://unpkg.com/${collectionName}/${collectionPath.replaceAll('./', '')}`,
      ),
    ),
  );

  const schematics = collection?.schematics;

  if (!schematics) {
    logger.error(`This collection doesn't have any schematic declared`);
    process.exit(1);
  }

  if (schematicName) {
    let schematic: Schematic = schematics[schematicName];

    if (!schematic) {
      schematic = findSchematicByAlias(schematics, schematicName);
      schematicName = schematic.schematicName;
    }

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

    // TODO: what happen when the path has '..'?

    const cPath = collectionPath
      .split('/')
      .filter((x) => x !== '.' && x !== 'collection.json')
      .join('/');

    const schema: JsonSchema = JSON.parse(
      JSON.stringify(
        await fetchData(
          `https://unpkg.com/${collectionName}${cPath ? '/' + cPath : ''}/${schemaPath.replaceAll('./', '')}`,
        ),
      ),
    );

    if (!schema.properties) {
      logger.info(`The schematic: ${schematicName} doesn't have any option.`);
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
    console.log(
      colors.blue(
        `List of schematics for ${colors.bold(collectionName)}:
${Object.entries(schematics)
  .filter(
    ([name, options]) =>
      name !== 'builder-add' && name !== 'ng-add' && !options?.hidden,
  )
  .map(([schematic]) => {
    const aliases = schematics[schematic]?.aliases;

    return `    - builder exec ${collectionName} ${colors.bold(schematic)} ${aliases ? `(aliases: ${aliases.join(', ')})` : ''} [options]`;
  })
  .join('\n')}`,
      ),
    );

    logger.info(
      'To see all the options for any of these schematics use this command: builder info <collection-name> <schematic-name>',
    );
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
