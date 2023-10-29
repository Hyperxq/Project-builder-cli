import { AbstractRunner } from '../runners';
import { SchematicOption } from './schematic.option';

export interface Schematic {
  name: string;
  alias: string;
  description: string;
}

export abstract class AbstractCollection {
  constructor(
    protected collection: string,
    protected runner: AbstractRunner,
  ) {}

  public async execute(
    name: string,
    options: SchematicOption[],
    extraFlags?: string,
  ) {
    let command = this.buildCommandLine(name, options);
    command = extraFlags ? command.concat(` ${extraFlags}`) : command;
    await this.runner.run(command);
  }

  public abstract getSchematics(): Schematic[];

  private buildCommandLine(name: string, options: SchematicOption[]): string {
    return `${this.collection}:${name}${this.buildOptions(options)}`;
  }

  private buildOptions(options: SchematicOption[]): string {
    return options.reduce((line, option) => {
      return line.concat(` ${option.toCommandString()}`);
    }, '');
  }
}
