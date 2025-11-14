import chalk from 'chalk';
import { EMOJIS } from './emojis';

export const MESSAGES = {
  RUNNER_EXECUTION_ERROR: (command: string) =>
    `\nFailed to execute command: ${command}`,
  WELCOME: (name: string, createBy: string) => ` 
  ${chalk.green(
    '_______________________________________________________________________________________________________________',
  )}
  
  ${chalk.blue("Template's name")}: ${chalk.green(name)}
  ${chalk.blue('Created by')}: ${chalk.green(createBy)}
  ${chalk.green(
    '_______________________________________________________________________________________________________________',
  )}
  `,
  CREATING_WORKSPACE: (workspaceName: string) =>
    `${chalk.blue(`Creating the ${chalk.bold(workspaceName)} workspace`)}`,
  WORKSPACE_CREATED: `${chalk.green('Workspace created successfully!')} ${EMOJIS.WINE}`,
};
