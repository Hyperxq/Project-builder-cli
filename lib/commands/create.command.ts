import { Command } from 'commander';
import { AbstractCommand } from './abstract.command';
import { Input } from './command.input.interface';

export class CreateCommand extends AbstractCommand {
  public load(program: Command) {
    program
      .command('create [template-id]')
      .alias('c')
      .option(
        '--dry-run',
        'Report actions that would be taken without writing out results.',
        false,
      )
      .option('-s, --skip-installation', 'Skip package installation.', false)
      .description(
        'Create a workspace and execute many schematic depends on the template-id',
      )
      .addHelpCommand('create --help', 'show assistance')
      .action(async (templateId: string, command: { [key: string]: any }) => {
        const dryRun: boolean = command?.dryRun;
        const skipInstall: boolean = command?.skipInstall;

        const options: Input[] = [];
        const inputs: Input[] = [
          {
            name: 'template-id',
            value: templateId,
          },
        ];

        // TODO: implement the logic behind these flags.

        options.push({ name: 'dry-run', value: dryRun });
        options.push({ name: 'skip-install', value: skipInstall });

        await this.action.handle(inputs, options);
      });
  }
}
