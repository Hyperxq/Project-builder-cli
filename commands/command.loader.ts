/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Command } from 'commander';
import { CreateAction, ExecuteAction, NewAction } from '../actions';
import { AddAction } from '../actions/add.action';
import { InfoAction } from '../actions/info.action';
import { ERROR_PREFIX } from '../lib/ui';
import { colors } from '../lib/utils';
import { AddCommand } from './add.command';
// import { CreateCommand } from './create.command';
import { ExecuteCommand } from './execute.command';
import { InfoCommand } from './info.command';
import { NewCommand } from './new.command';

export class CommandLoader {
  public static async load(program: Command): Promise<void> {
    new NewCommand(new NewAction()).load(program);
    // new CreateCommand(new CreateAction()).load(program);
    new ExecuteCommand(new ExecuteAction()).load(program);
    new AddCommand(new AddAction()).load(program);
    new InfoCommand(new InfoAction()).load(program);

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
