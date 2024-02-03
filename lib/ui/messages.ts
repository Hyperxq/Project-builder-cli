/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { colors } from '../utils';
import { EMOJIS } from './emojis';

export const MESSAGES = {
  RUNNER_EXECUTION_ERROR: (command: string) =>
    `\nFailed to execute command: ${command}`,
  WELCOME: (name: string, createBy: string) => ` 
  ${colors.green(
    '_______________________________________________________________________________________________________________',
  )}
  
  ${colors.blue("Template's name")}: ${colors.green(name)}
  ${colors.blue('Created by')}: ${colors.green(createBy)}
  ${colors.green(
    '_______________________________________________________________________________________________________________',
  )}
  `,
  CREATING_WORKSPACE: (workspaceName: string) =>
    `${colors.blue(`Creating the ${colors.bold(workspaceName)} workspace`)}`,
  WORKSPACE_CREATED: `${colors.green('Workspace created successfully!')} ${EMOJIS.WINE}`,
};
