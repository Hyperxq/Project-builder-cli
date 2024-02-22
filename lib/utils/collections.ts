/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { join } from 'path';
import { spawnAsync } from './commands';
import { findPackageJson, isDependencyInstalled } from './dependencies';
import { logger } from './logger';

export async function checkCollection(
  collection: string,
  path: string = '',
): Promise<boolean> {
  try {
    const doesPackageJSONExist = await findPackageJson(path ?? __dirname);
    const isInstalled = await isDependencyInstalled(
      collection,
      path ?? __dirname,
    );

    if (!isInstalled) {
      logger.info('Temporal installation package: ' + collection, [
        `command executed: npm install ${!doesPackageJSONExist ? '-g' : ''} ${collection}`,
      ]);

      await spawnAsync(
        'npm',
        ['install', !doesPackageJSONExist ? '-g' : '', collection],
        {
          cwd: path ?? process.cwd(),
          stdio: 'inherit',
          shell: true,
        },
      );

      // spawnSync('npm', ['install', collection], { stdio: 'ignore' });
      return isInstalled;
    }
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
}

export async function uninstallCollection(collection: string, path?: string) {
  try {
    logger.info('Uninstalling of temporal package: ' + collection, [
      'command executed: ' + 'npm uninstall ' + collection,
    ]);
    // spawnSync('npm', ['uninstall', collection], { stdio: 'ignore' });
    await spawnAsync('npm', ['uninstall', collection], {
      cwd: path ?? process.cwd(),
      stdio: 'inherit',
      shell: true,
    });
    // spawnSync('npm', ['uninstall', collection], { stdio: 'inherit' });
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
}
