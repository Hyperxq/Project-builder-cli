import { AddAction } from '../actions/add.action';
import { packageManagerUninstallCommands } from '../enums/package-manager.enum';
import { spawnAsync } from './commands';
import { isDependencyInstalled } from './dependencies';
import { logger } from './logger';

export async function checkCollection(
  collection: string,
  path: string = '',
  packageManager: string = 'npm',
  dryRun: boolean = false,
  registry?: string,
  keepInstalled: boolean = false,
): Promise<boolean> {
  try {
    const isInstalled = await isDependencyInstalled(
      collection,
      path ?? __dirname,
    );

    if (!isInstalled) {
      const addAction = new AddAction();
      await addAction.handle(
        [
          { name: 'collection-name', value: collection },
          { name: 'save-dev', value: true }, // Default to devDependency
        ],
        [
          { name: 'registry', value: registry },
          { name: 'dry-run', value: dryRun },
          { name: 'package-manager', value: packageManager },
        ],
      );
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
    logger.info(
      'Uninstalling of temporal package: ' +
        collection +
        '; command executed: ' +
        packageManager +
        ` ${packageManagerUninstallCommands[packageManager]} ` +
        collection,
    );

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
