import { Input } from '../commands'
import { EMOJIS } from '../ui'
import chalk from 'chalk'
import { AbstractCli } from './abstract.cli'

export class NestJSCli extends AbstractCli {
  constructor() {
    super(`nest`)
  }

  static findClosestBinary(): string {
    try {
      // NOTE: As a requirement, every user needs to install the nest cli
      return require.resolve('@nestjs/cli/bin/nestjs.js')
    } catch (e) {
      console.log(e)
      throw new Error(
        `${chalk.blue(
          EMOJIS['BROKEN_HEART'] +
            " NestJS cli doesn't install, please execute:",
        )} ${chalk.green('npm i -g @nestjs/cli')}`,
      )
    }
  }

  public getGenerateCommand(inputs: string[] = [], flags: Input[] = []) {
    return this.buildCommandLine({ command: 'generate', inputs, flags })
  }

  public getNewCommand(inputs: string[] = [], flags: Input[] = []): string {
    return this.buildCommandLine({ command: 'new', inputs, flags })
  }
}
