import { Command } from 'commander';
import { AbstractCommand } from './abstract.command';
import { Input } from './command.input.interface';

export class ConfigCommand extends AbstractCommand {
  public load(program: Command) {
    program
      .command('config')
      .description('Manage builder CLI configuration')
      .argument('<action>', 'get | set | delete | list')
      .argument('[key]', 'Config key')
      .argument('[value]', 'Value to set (for set only)')
      .option('-g, --global', 'Use global config (default)', true)
      .action(async (action, key, value, options) => {
        const inputs: Input[] = [
          {
            name: 'action',
            value: action,
          },
          {
            name: 'key',
            value: key,
          },
          {
            name: 'value',
            value: value,
          },
        ];
        const flags: Input[] = [
          {
            name: 'useGlobal',
            value: options.global,
          },
        ];

        await this.action.handle(inputs, flags);
      });
  }
}
