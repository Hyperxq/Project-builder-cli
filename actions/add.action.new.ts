/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/* eslint-disable import/no-extraneous-dependencies */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import npa from 'npm-package-arg';
import { json } from 'npm-registry-fetch';
import { resolve } from 'path';
import { catchError, filter, firstValueFrom, take, takeWhile } from 'rxjs';
import { Input } from '../commands';
import { packageManagerCommands } from '../enums/package-manager.enum';
import { SchematicsCollectionSchema } from '../interfaces/schema.interface';
import { CLIFactory, SchematicsCli } from '../lib/CLI';
import { SchematicOrchestrator } from '../lib/singleton';
import {
  Spinner,
  colors,
  findInput,
  findPackageJson,
  installDependencies,
  isDependencyInstalled,
  logger,
  spawnAsync,
  uninstallDependencies,
} from '../lib/utils';
import { AbstractAction } from './abstract.action';

export class AddAction extends AbstractAction {
  public async handle(inputs: Input[], flags: Input[]) {
    await addSchematic(inputs, flags);
  }
}

const addSchematic = async (inputs: Input[] = [], flags: Input[] = []) => {
  /*
   * 1. Get the orchestrator instance.
   * 2. Call the orchestrator to install.
   * 3. Wait the orchestrator to continue with the execution.
   * 4. Execute the schematic builder-add.
   * 5. Notify that the execution phase finished.
   */
  return new Promise<void>((resolve, reject) => {
    // * we need the id, and the way to wait when the installation finished, a way to notify that
    const collectionName = findInput(inputs, 'collection-name')
      ?.value as string;
    const { id, waitInstallationFinished, notifyExecutionCompletion } =
      SchematicOrchestrator.startInstallation(collectionName);

    waitInstallationFinished
      .pipe(
        takeWhile((value) => value === id),
        take(1),
      )
      .subscribe({
        next: () => {
          // ** all the execution process

          notifyExecutionCompletion();
          resolve();
        },
        error: (error) => reject(error),
      });
  });
};
