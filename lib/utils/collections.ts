/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { join } from 'path';
import {
  packageManagerCommands,
  packageManagerUninstallCommands,
} from '../../enums/package-manager.enum';
import { spawnAsync } from './commands';
import { findPackageJson, isDependencyInstalled } from './dependencies';
import { logger } from './logger';

export async function checkCollection(
  collection: string,
  path: string = '',
  packageManager: string = 'npm',
  dryRun: boolean = false,
  registry?: string,
): Promise<boolean> {
  try {
    const doesPackageJSONExist = await findPackageJson(path ?? process.cwd());
    const isInstalled = await isDependencyInstalled(
      collection,
      path ?? __dirname,
    );

    if (!isInstalled) {
      logger.info('Temporal installation package: ' + collection, [
        `command executed: ${packageManager} ${packageManagerCommands[packageManager]} ${!doesPackageJSONExist ? '-g' : ''} ${collection}`,
      ]);

      if (!dryRun) {
        await spawnAsync(
          packageManager,
          [
            packageManagerCommands[packageManager],
            !doesPackageJSONExist ? '-g' : '',
            collection,
            registry ? `--registry=${registry}` : '',
          ],
          {
            cwd: path ?? process.cwd(),
            stdio: 'inherit',
            shell: true,
          },
        );
      }
    }

    return isInstalled;
  } catch (error) {
    if (error?.message) {
      logger.error(error?.message);
    }
    process.exit(1);
  }
}

export async function uninstallCollection(
  collection: string,
  path?: string,
  packageManager: string = 'npm',
  dryRun: boolean = false,
) {
  try {
    logger.info('Uninstalling of temporal package: ' + collection, [
      'command executed: ' +
        packageManager +
        ` ${packageManagerUninstallCommands[packageManager]} ` +
        collection,
    ]);

    if (!dryRun) {
      await spawnAsync(
        packageManager,
        [packageManagerUninstallCommands[packageManager], collection],
        {
          cwd: path ?? process.cwd(),
          stdio: 'inherit',
          shell: true,
        },
      );
    }
  } catch (error) {
    if (error?.message) {
      logger.error(error?.message);
    }
    process.exit(1);
  }
}
