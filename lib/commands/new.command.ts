import { kebabCase } from 'case-anything'
import { Command } from 'commander'
import { logger } from '../utils'
import { AbstractCommand } from './abstract.command'
import { Input } from './command.input.interface'

export class NewCommand extends AbstractCommand {
  public load(program: Command) {
    program
      .command('new <library-name> [author]')
      .description('Create a new schematic library ready to be published')
      .option(
        '--bundler <bundler-name>',
        'With bundler do you want to use to compile the project: rollup, ts',
        'rollup',
      )
      .option(
        '-s, --skip-installation',
        'You can skip installation when the project is created.',
        false,
      )
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
      // .option(
      //   '-s, --silent-mode',
      //   'Report actions that would be taken without writing out results.',
      // )
      .option(
        '-d, --dry-run',
        'Report actions that would be taken without writing out results.',
        false,
      )
      .action(
        async (
          libraryName: string,
          author: string,
          options: { [key: string]: any },
        ) => {
          const inputs: Input[] = []
          const flags: Input[] = []

          Object.entries(options).forEach(([name, value]) => {
            flags.push({
              name: kebabCase(name),
              value,
            })
          })

          inputs.push({
            name: 'name',
            value: libraryName,
          })

          inputs.push({
            name: 'author',
            value: author,
          })

          await this.action.handle(inputs, flags)
        },
      )
  }
}
