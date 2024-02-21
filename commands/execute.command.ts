/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { kebabCase } from 'case-anything';
import { Command } from 'commander';
import { AbstractCommand } from './abstract.command';
import { Input } from './command.input.interface';

export class ExecuteCommand extends AbstractCommand {
  public load(program: Command) {
    program
      .command('execute <collection> <schematic>')
      .alias('exec')
      .description('Execute any schematics no matter the workspace')
      .option(
        '-d, --dry-run',
        'Report actions that would be taken without writing out results.',
        false,
      )
      .allowUnknownOption(true)
      .parse(process.argv)
      .action(
        async (
          collection: string,
          schematic: string,
          options: { [key: string]: any },
          commands: any,
        ) => {
          const { args, processedArgs } = commands;

          if (collection) {
            delete options?.collection;
          }

          const inputs: Input[] = [];

          inputs.push({ name: 'schematic', value: schematic });
          inputs.push({
            name: 'collection',
            value: collection,
          });

          const flags: Input[] = [];

          Object.entries(options).forEach(([name, value]) => {
            flags.push({
              name: kebabCase(name),
              value,
            });
          });

          flags.push(...getUnknownOptions(args, processedArgs));

          await this.action.handle(inputs, flags);
        },
      );
  }
}

// TODO: recheck this method,
function getUnknownOptions(args: string[], processedArgs: string[]) {
  const unknownArgs =
    args.filter((arg) => !processedArgs.some((pa) => pa === arg)) ?? [];

  return unknownArgs.map((arg) => {
    if (arg.startsWith('--') || arg.startsWith('-')) {
      const [name, value] = arg.split('=');

      return { name: name.replace(/^--?/, ''), value };
    } else {
      console.log(
        `The argument ${arg} is  no following the pattern --[option-name]=[value] or -[option-name]=[value] or --[option-name]`,
      );
    }
  });
}
