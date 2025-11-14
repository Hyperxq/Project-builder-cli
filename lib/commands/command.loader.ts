import chalk from 'chalk';
import { Command } from 'commander';
import { ConfigAction, ExecuteAction, NewAction } from '../actions';
import { AddAction } from '../actions/add.action';
import { InfoAction } from '../actions/info.action';
import { ERROR_PREFIX } from '../ui';
import {
  AddCommand,
  ConfigCommand,
  ExecuteCommand,
  InfoCommand,
  NewCommand,
} from '.';

export class CommandLoader {
  public static async load(program: Command): Promise<void> {
    new NewCommand(new NewAction()).load(program);
    new ExecuteCommand(new ExecuteAction()).load(program);
    new AddCommand(new AddAction()).load(program);
    new InfoCommand(new InfoAction()).load(program);
    new ConfigCommand(new ConfigAction()).load(program);

    this.handleInvalidCommand(program);
  }

  private static handleInvalidCommand(program: Command) {
    program.on('command:*', () => {
      console.error(
        `\n${ERROR_PREFIX} Invalid command: ${chalk.red('%s')}`,
        program.args.join(' '),
      );
      console.log(
        `See ${chalk.red('--help')} for a list of available commands.\n`,
      );
      process.exit(1);
    });
  }
}
