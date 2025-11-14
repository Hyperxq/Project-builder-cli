import chalk from 'chalk';
import { Input } from '../commands';
import { deleteConfig, findInput, getConfig, listConfig, logger, setConfig, spawnAsync } from '../utils';
import { AbstractAction } from './abstract.action';

export class ConfigAction extends AbstractAction {
  public async handle(
    inputs: Input[],
    flags: Input[],
    extraFlags: string[],
  ): Promise<void> {
    try {
      await generateFiles(inputs, flags, extraFlags);
    } catch (error) {
      if (error?.message) {
        logger.error(error?.message);
      }
      process.exit(1);
    }
  }
}

const generateFiles = async (
  inputs: Input[] = [],
  flags: Input[] = [],
  extraFlags: string[] = [],
) => {
  const useGlobal = findInput(flags, 'useGlobal').value as boolean;
  const action = findInput(inputs, 'action').value as string;
  const key = findInput(inputs, 'key').value as string;
  const value = findInput(inputs, 'value').value as string;

  logger.debug(`Config action: ${action}, key: ${key}, global: ${useGlobal}`);

  switch (action) {
    case 'get': {
      if (!key) {
        logger.error('Missing key for get');
        console.log(chalk.red('Error: Please specify a key to get.'));
        process.exit(1);
      }
      const result = getConfig(key, useGlobal);
      if (result === undefined) {
        console.log(chalk.yellow('[undefined]'));
      } else {
        console.log(result);
      }
      break;
    }

    case 'set': {
      if (!key || value === undefined) {
        logger.error('Missing key or value for set');
        console.log(
          chalk.red('Error: Usage is "builder config set <key> <value>"'),
        );
        process.exit(1);
      }
      setConfig(key, value, useGlobal);
      logger.info(`Set config "${key}" to "${value}"`);
      console.log(chalk.green(`✔ Set ${key} = ${value}`));
      break;
    }

    case 'delete': {
      if (!key) {
        logger.error('Missing key for delete');
        console.log(chalk.red('Error: Please specify a key to delete.'));
        process.exit(1);
      }
      deleteConfig(key, useGlobal);
      logger.warn(`Deleted config "${key}"`);
      console.log(chalk.yellow(`🗑 Deleted ${key}`));
      break;
    }

    case 'list': {
      const entries = listConfig(useGlobal);
      if (Object.keys(entries).length === 0) {
        console.log(chalk.gray('No config values found.'));
      } else {
        console.log(
          chalk.cyanBright(`${useGlobal ? 'Global' : 'Local'} config:`),
        );
        console.log(JSON.stringify(entries, null, 2));
      }
      break;
    }

    default: {
      logger.error(`Unknown config action: ${action}`);
      console.log(
        chalk.red(`Unknown action "${action}". Use: get, set, delete, list.`),
      );
      process.exit(1);
    }
  }
};
