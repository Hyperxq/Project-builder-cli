import { AbstractCli } from './abstract.cli';
import { CommandOptions, SchematicCommandOptions } from './cli.interfaces';
import { Input } from '../../commands';
import { colors } from '../utils';
import { EMOJIS } from '../ui';

export class SchematicsCli extends AbstractCli {
  constructor() {
    super(`"${SchematicsCli.findClosestBinary()}"`);
  }

  static findClosestBinary(): string {
    try {
      return require.resolve(
        '@angular-devkit/schematics-cli/bin/schematics.js',
      );
    } catch (e) {
      console.log(e);
      throw new Error(
        `${colors.red(
          `${EMOJIS['BROKEN_HEART']} Schematics CLI doesn't installed, please execute:`,
        )} ${colors.green('npm i -g @angular-devkit/schematics-cli')}`,
      );
    }
  }

  override buildCommandLine({
    collection,
    schematic,
    inputs,
    flags,
  }: SchematicCommandOptions): string {
    return `${collection}:${schematic} ${this.buildInputs(
      inputs,
    )} ${this.buildFlags(flags)}`;
  }

  buildBlankCommand({ command, inputs, flags }: CommandOptions): string {
    return `${command} ${this.buildInputs(inputs)} ${this.buildFlags(flags)}`;
  }

  public getExecuteCommand(
    collection: string,
    schematic: string,
    inputs: string[] = [],
    flags: Input[] = [],
  ) {
    return this.buildCommandLine({
      collection,
      schematic,
      inputs,
      flags,
    });
  }

  public getNewCommand(inputs: string[] = [], flags: Input[] = []): string {
    return this.buildBlankCommand({ command: 'blank', inputs, flags });
  }
}
