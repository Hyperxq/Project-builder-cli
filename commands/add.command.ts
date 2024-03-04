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

export class AddCommand extends AbstractCommand {
  public load(program: Command) {
    program
      .command('add <collection-name>')
      .option(
        '--save-dev',
        'Add the collection package to the Dev dependencies',
        false,
      )
      .option(
        '-d, --dry-run',
        'Report actions that would be taken without writing out results.',
      )
      .action(
        async (
          libraryName: string,
          author: string,
          options: { [key: string]: any },
        ) => {
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

          inputs.push({
            name: 'author',
            value: author,
          });

          await this.action.handle(inputs, flags);
        },
      );
  }
}
