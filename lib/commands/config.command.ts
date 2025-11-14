import chalk from 'chalk';
import { Command } from 'commander';
import { deleteConfig, getConfig, logger, setConfig } from '../utils';
import { AbstractCommand } from './abstract.command';

export class AddCommand extends AbstractCommand {
  public load(program: Command) {
    program
      .command('config')
      .description('Manage builder CLI configuration')
      .argument('<action>', 'get | set | delete | list')
      .argument('[key]', 'Config key')
      .argument('[value]', 'Value to set (for set only)')
      .action((action, key, value) => {
        switch (action) {
          case 'get':
            if (!key) {
              logger.info(chalk.red('Please specify a key to get'));
              process.exit(1);
            }
            const result = getConfig(key);
            logger.info(result ?? chalk.yellow('[undefined]'));
            break;
          case 'set':
            if (!key || value === undefined) {
              logger.info(chalk.red('Usage: config set <key> <value>'));
              process.exit(1);
            }
            setConfig(key, value);
            logger.info(chalk.green(`✔ Set ${key} = ${value}`));
            break;
          case 'delete':
            deleteConfig(key);
            logger.info(chalk.yellow(`🗑 Deleted ${key}`));
            break;
          case 'list':
            logger.info(getConfig());
            break;
          default:
            logger.info(chalk.red(`Unknown action: ${action}`));
            break;
        }
      });
  }
}
