/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { kebabCase } from 'case-anything';
import { Command } from 'commander';
import { AbstractCommand } from './abstract.command';
import { Input } from './command.input.interface';

export class NewCommand extends AbstractCommand {
  public load(program: Command) {
    program
      .command('new <library-name>')
      .option(
        '-b, --bundler',
        'With bundler do you want to use to compile the project: rollup, ts',
        'rollup',
      )
      .option('-a, --author', 'Author for the new schematic.')
      .option(
        '-d, --dry-run',
        'Report actions that would be taken without writing out results.',
      )
      .action(async (libraryName: string, options: { [key: string]: any }) => {
        const inputs: Input[] = [];
        const flags: Input[] = [];

        Object.entries(options).forEach(([name, value]) => {
          flags.push({
            name: kebabCase(name),
            value,
          });
        });

        inputs.push({
          name: 'library-name',
          value: libraryName,
        });

        await this.action.handle(inputs, flags);
      });
  }
}
