import { AbstractCommand } from './abstract.command';
import { Command } from 'commander';
import { Input } from './command.input';

export class GenerateCommand extends AbstractCommand {
  public async load(program: Command): Promise<void> {
    program
      .command('generate <schematic> [name] [path]')
      .alias('g')
      // TODO: we need to get the right description depends on the command
      // .description(await this.buildDescription())
      .option(
        '--flat',
        'Enforce flat structure of generated element.',
        () => true,
      )
      .option(
        '-d, --dry-run',
        'Report actions that would be taken without writing out results.',
      )
      .option(
        '-c, --collection [collectionName]',
        'Schematics collection to use.',
      )
      .option('--skip-import', 'Skip importing', () => true, false)
      .action(
        async (
          schematic: string,
          name: string,
          path: string,
          command: { [key: string]: any },
        ) => {
          const { dryRun, flat, collection, skipImport } = command;
          const options: Input[] = [];

          if (flat !== undefined) options.push({ name: 'flat', value: flat });
          options.push({ name: 'dry-run', value: !!dryRun });
          options.push({ name: 'skip-import', value: !!skipImport });
          options.push({
            name: 'collection',
            value: collection,
          });

          const inputs: Input[] = [];
          inputs.push({ name: 'schematic', value: schematic });
          inputs.push({ name: 'name', value: name });
          inputs.push({ name: 'path', value: path });

          await this.action.handle(inputs, options);
        },
      );
  }
}
