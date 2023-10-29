import { AbstractCli } from './abstract.cli';
import { Input } from '../../commands';

export class AngularCli extends AbstractCli {
  constructor() {
    super(`"${AngularCli.findClosestBinary().trim()}"`);
  }

  static findClosestBinary(): string {
    try {
      return require.resolve('@angular/cli/bin/ng.js');
    } catch (e) {
      console.log(e);
      throw new Error("'ng' binary path could not be found!");
    }
  }

  public getGenerateCommand(
    inputs: string[] = [],
    flags: Input[] = [],
  ): string {
    return this.buildCommandLine({ command: 'generate', inputs, flags });
  }

  public getNgNewCommand(inputs: string[] = [], flags: Input[] = []): string {
    return this.buildCommandLine({ command: 'new', inputs, flags });
  }
}
