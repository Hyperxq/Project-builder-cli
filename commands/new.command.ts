/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Command } from 'commander';
import { AbstractCommand } from './abstract.command';

export class NewCommand extends AbstractCommand {
  public async load(program: Command): Promise<void> {
    program
      .command('new <library-name>')
      .alias('exc')
      .option(
        '-d, --dry-run',
        'Report actions that would be taken without writing out results.',
      )
      .action(async () => {
        console.log('execute works!!!');
      });
  }
}
