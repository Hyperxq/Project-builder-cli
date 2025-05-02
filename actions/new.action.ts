/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { strings } from '@angular-devkit/schematics'
import * as fs from 'fs'
import { Input } from '../commands'
import { CLIFactory, SchematicsCli } from '../lib/CLI'
import { CLI } from '../lib/CLI/cli.enum'
import { Collection } from '../lib/schematics'
import { colors, findInput, logger, spawnAsync } from '../lib/utils'
import { AbstractAction } from './abstract.action'

export class NewAction extends AbstractAction {
  public async handle(inputs: Input[], flags: Input[]) {
    try {
      await generateFiles(inputs, flags)
    } catch (error) {
      if (error?.message) {
        logger.error(error?.message)
      }
      process.exit(1)
    }
  }
}

const generateFiles = async (inputs: Input[] = [], flags: Input[] = []) => {
  // TODO: the name can have a path
  const name = strings.dasherize(findInput(inputs, 'name').value as string)
  const author: Input = findInput(inputs, 'author')
  const bundler: Input = findInput(flags, 'bundler')
  const skipInstall: Input = findInput(flags, 'skip-installation')
  const packageManager = findInput(flags, 'package-manager')?.value as
    | 'npm'
    | 'yarn'
    | 'pnpm'
    | 'cnpm'
    | 'bun'
  const dryRun = findInput(flags, 'dry-run')?.value as boolean

  const schematicCli = CLIFactory(CLI.SCHEMATICS) as SchematicsCli

  logger.info('Creating the library project named: ' + colors.bold(name))

  /*
   * 1. Init empty repo.
   * 2. Execute new schematic.
   * 3. Install packages (if the user wants).
   * 4. Implements dry-run.
   */

  await initProject(packageManager, strings.dasherize(name), dryRun)
  const options = [
    findInput(inputs, 'name'),
    bundler,
    findInput(flags, 'dry-run'),
  ]
  if (author.value) {
    options.push(author)
  }
  await schematicCli.runCommand(
    schematicCli.getExecuteCommand(Collection.SM, 'new', [], options),
    false,
    `./${!dryRun ? (strings.dasherize(name) as string) : ''}`,
  )

  installDependencies(
    packageManager,
    name,
    dryRun,
    skipInstall.value as boolean,
  )

  if (!dryRun) {
    logger.info('Project Name: ' + name)
  }
}

async function initProject(
  packageManager: string,
  projectName: string,
  dryRun: boolean,
) {
  if (dryRun) {
    return
  }
  fs.mkdirSync(projectName, { recursive: true })

  const initCommands = {
    npm: 'init -y',
    yarn: 'init -y',
    pnpm: 'init',
    cnpm: 'init -y',
    bun: 'init -y',
  }

  await spawnAsync(packageManager, [initCommands[packageManager]], {
    cwd: projectName ?? process.cwd(),
    stdio: 'inherit',
    shell: true,
  })
}

async function installDependencies(
  packageManager: string,
  projectName: string,
  dryRun: boolean = false,
  skipInstall: boolean = false,
) {
  if (dryRun) {
    return
  }

  if (dryRun || skipInstall) {
    return
  }

  await spawnAsync(packageManager, ['install'], {
    cwd: projectName ?? process.cwd(),
    stdio: 'inherit',
    shell: true,
  })
}
