import { AbstractCli } from './abstract.cli';
import { Input } from '../../commands';
import { colors } from '../utils';
import { EMOJIS } from '../ui';

export class NestJSCli extends AbstractCli {
  constructor() {
    super(`nest`);
  }

  static findClosestBinary(): string {
    try {
      // NOTE: As a requirement, every user needs to install the nest cli
      return require.resolve('@nestjs/cli/bin/nestjs.js');
    } catch (e) {
      console.log(e);
      throw new Error(
        `${colors.blue(
          EMOJIS['BROKEN_HEART'] +
            " NestJS cli doesn't install, please execute:",
        )} ${colors.green('npm i -g @nestjs/cli')}`,
      );
    }
  }

  public getGenerateCommand(inputs: string[] = [], flags: Input[] = []) {
    return this.buildCommandLine({ command: 'generate', inputs, flags });
  }
}
