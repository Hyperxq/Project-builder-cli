import { kebabCase } from 'case-anything'
import { Command } from 'commander'
import { logger } from '../utils'
import { AbstractCommand } from './abstract.command'
import { Input } from './command.input.interface'

export class InfoCommand extends AbstractCommand {
  public load(program: Command) {
    program
      .command('info <collection-name> [schematic-name]')
      .option('--registry <registry>', 'The NPM registry to use.')
      .description(
        'Show information about a schematic or a collection, so you can see all the options allowed by a schematic',
      )
      .addHelpText(
        'before',
        `You can see all the schematics that a collections has or see all the options allowed by a schematic`,
      )
      .action(
        async (
          collectionName: string,
          schematicName: string,
          options: { [key: string]: any },
        ) => {
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

            inputs.push({
              name: 'schematic-name',
              value: schematicName,
            })

            await this.action.handle(inputs, flags)
          } catch (error) {
            logger.error(error?.message ?? '')
            process.exit(1)
          }
        },
      )
  }
}
