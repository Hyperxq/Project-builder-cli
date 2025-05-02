/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { kebabCase } from 'case-anything'
import { Command } from 'commander'
import { logger } from '../lib/utils'
import { AbstractCommand } from './abstract.command'
import { Input } from './command.input.interface'

export class AddCommand extends AbstractCommand {
  public load(program: Command) {
    program
      .command('add <collection-name>')
      .description(
        'Add a schematic library to the project, so if the library has a builder-add/ng-add it will be executed after the installation',
      )
      .option(
        '--save-dev',
        'Add the collection package to the Dev dependencies',
        true,
      )
      .option(
        '-d, --dry-run',
        'Report actions that would be taken without writing out results.',
        false,
      )
      .option('--registry <registry>', 'The NPM registry to use.')
      .option(
        '--package-manager <manager>',
        'The package manager used to install dependencies.     [string] [choices: "npm", "yarn", "pnpm", "cnpm", "bun"]',
        (value: string) => {
          if (
            !['npm', 'yarn', 'pnpm', 'cnpm', 'bun'].some((v) => value === v)
          ) {
            logger.error(`You entered a not valid package manager`)
            process.exit(1)
          }

          return value
        },
        'npm',
      )
      .addHelpText(
        'before',
        `The <collection-name> can include the version, for example: @builder/astro@1.1.0`,
      )
      .action(
        async (collectionName: string, options: { [key: string]: any }) => {
          try {
            const inputs: Input[] = []
            const flags: Input[] = []

            Object.entries(options).forEach(([name, value]) => {
              flags.push({
                name: kebabCase(name),
                value,
              })
            })

            inputs.push({
              name: 'collection-name',
              value: collectionName,
            })

            await this.action.handle(inputs, flags)
          } catch (error) {
            if (error?.message) {
              logger.error(error?.message)
            }
            process.exit(1)
          }
        },
      )
  }
}
