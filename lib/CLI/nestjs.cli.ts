import { AbstractCli } from './abstract.cli';
import { Input } from '../../commands';

export class NestJSCli extends AbstractCli {
  constructor() {
    super(NestJSCli.findClosestBinary());
  }

  static findClosestBinary(): string {
    try {
      return require.resolve('@nestjs/cli/bin/nestjs.js');
    } catch (e) {
      console.log(e);
      throw new Error("'nestjs' binary path could not be found!");
    }
  }

  public getGenerateCommand(inputs: string[] = [], flags: Input[] = []) {
    return this.buildCommandLine({ command: 'generate', inputs, flags });
  }
}
