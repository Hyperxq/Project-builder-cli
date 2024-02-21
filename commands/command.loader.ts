/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Command } from 'commander';
import { CreateAction, ExecuteAction } from '../actions';
import { ERROR_PREFIX } from '../lib/ui';
import { colors } from '../lib/utils';
import { CreateCommand } from './create.command';
import { ExecuteCommand } from './execute.command';

export class CommandLoader {
  public static async load(program: Command): Promise<void> {
    // await new NewCommand(new ExecuteAction()).load(program);
    new CreateCommand(new CreateAction()).load(program);
    new ExecuteCommand(new ExecuteAction()).load(program);

    this.handleInvalidCommand(program);
  }

  private static handleInvalidCommand(program: Command) {
    program.on('command:*', () => {
      console.error(
        `\n${ERROR_PREFIX} Invalid command: ${colors.red('%s')}`,
        program.args.join(' '),
      );
      console.log(
        `See ${colors.red('--help')} for a list of available commands.\n`,
      );
      process.exit(1);
    });
  }
}
