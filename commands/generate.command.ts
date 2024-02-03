/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Command } from 'commander';
import { AbstractCommand } from './abstract.command';
import { Input } from './command.input.interface';

export class GenerateCommand extends AbstractCommand {
  public async load(program: Command): Promise<void> {
    program
      .command('generate <schematic>')
      .alias('g')
      .description('Execute any schematics no matter the workspace')
      .option(
        '-d, --dry-run',
        'Report actions that would be taken without writing out results.',
        false,
      )
      .option(
        '-c, --collection [collectionName]',
        'Schematics collection to use.',
      )
      .allowUnknownOption()
      .action(async (schematic: string, command: { [key: string]: any }) => {
        const { dryRun, flat } = command;
        const collection = command?.collection;

        const flags: Input[] = [];

        flags.push({ name: 'dry-run', value: !!dryRun });

        const inputs: Input[] = [];
        inputs.push({ name: 'schematic', value: schematic });
        inputs.push({
          name: 'collection',
          value: collection,
        });

        await this.action.handle(inputs, flags);
      });
  }
}
