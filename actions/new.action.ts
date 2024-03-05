/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { join } from 'path';
import { Input } from '../commands';
import { CLIFactory, SchematicsCli } from '../lib/CLI';
import { CLI } from '../lib/CLI/cli.enum';
import projectBuilder from '../lib/config/library-schematics.json';
import { Collection } from '../lib/schematics';
import {
  checkCollection,
  colors,
  findInput,
  logger,
  uninstallCollection,
} from '../lib/utils';
import { AbstractAction } from './abstract.action';

export class NewAction extends AbstractAction {
  public async handle(inputs: Input[], flags: Input[]) {
    try {
      await generateFiles(inputs, flags);
    } catch (error) {
      logger.error(error.message);
      process.exit(1);
    }
  }
}

const generateFiles = async (inputs: Input[] = [], flags: Input[] = []) => {
  // TODO: the name can have a path
  const name = findInput(inputs, 'library-name');
  const packageManager = findInput(flags, 'package-manager')?.value as
    | 'npm'
    | 'yarn'
    | 'pnpm'
    | 'cnpm'
    | 'bun';
  /*
   * 1. Create the base project.
   * 2. Implement formatter and linters (pending to create the eslint schematic)
   * 3. Create empty folders (an schematic)
   * 4. Delete default files and folders.
   * 5. Add Docs.
   * 6. Implement the bundler.
   * */

  const schematicCli = CLIFactory(CLI.SCHEMATICS) as SchematicsCli;

  logger.info(
    'Creating the library project named: ' + colors.bold(name.value as string),
  );

  await schematicCli.runCommand(
    schematicCli.getNewCommand(
      inputs.map((i) => i.value as string),
      flags,
    ),
  );

  await checkCollection(
    Collection.PROJECTBUILDER,
    join(process.cwd(), name.value as string),
    packageManager,
  );

  const buffer = Buffer.from(JSON.stringify(projectBuilder)).toString('base64');

  await schematicCli.runCommand(
    schematicCli.getExecuteCommand(
      Collection.PROJECTBUILDER,
      'init',
      [],
      [
        {
          name: 'base64-string',
          value: buffer,
        },
        {
          name: 'package-manager',
          value: packageManager,
        },
      ],
    ),
    false,
    `./${name.value as string}`,
  );

  await uninstallCollection(
    Collection.PROJECTBUILDER,
    join(process.cwd(), name.value as string),
    packageManager,
  );

  logger.info('Project Name: ' + name.value);
};
