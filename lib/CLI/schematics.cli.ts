import { AbstractCli } from './abstract.cli';
import { SchematicCommandOptions } from './cli.interfaces';
import { Input } from '../../commands';

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
      throw new Error("'schematics' binary path could not be found!");
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

  public getExecuteCommand(
    collection: string,
    schematic: string,
    inputs: string[] = [],
    flags: Input[] = [],
  ) {
    return this.buildCommandLine({ collection, schematic, inputs, flags });
  }
}
