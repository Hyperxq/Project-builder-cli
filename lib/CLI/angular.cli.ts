import { AbstractCli } from './abstract.cli';
import { Input } from '../../commands';
import { execSync } from 'child_process';

export class AngularCli extends AbstractCli {
  constructor() {
    super(`"${AngularCli.findClosestBinary().trim()}"`);
  }

  static findClosestBinary(): string {
    try {
      // NOTE: As a requirement, every user needs to install the ng cli
      const globalNodeModulesPath = execSync('npm root -g').toString().trim();
      return require.resolve(globalNodeModulesPath + '/@angular/cli/bin/ng.js');
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
