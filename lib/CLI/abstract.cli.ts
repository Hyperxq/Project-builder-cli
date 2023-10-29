import { CommandOptions } from './cli.interfaces';
import { Input } from '../../commands';
import { ChildProcess, spawn, SpawnOptions } from 'child_process';
import { colors } from '../utils';
import { MESSAGES } from '../ui';

export abstract class AbstractCli {
  protected constructor(protected binary: string) {}

  public async runCommand(
    command: string,
    collect = false,
    cwd = process.cwd(),
  ) {
    const args: string[] = [command];
    const options: SpawnOptions = {
      cwd,
      stdio: collect ? 'pipe' : 'inherit',
      shell: true,
    };
    return new Promise<null | string>((resolve, reject) => {
      const child: ChildProcess = spawn(
        `node`,
        [this.binary, ...args],
        options,
      );

      if (collect) {
        child.stdout!.on('data', (data) =>
          resolve(data.toString().replace(/\r\n|\n/, '')),
        );
      }

      try {
        child.on('close', (code) => {
          if (code === 0) {
            resolve(null);
          } else {
            //TODO: Remove unused messages
            console.error(
              colors.red(
                MESSAGES.RUNNER_EXECUTION_ERROR(`${this.binary} ${command}`),
              ),
            );
            reject();
          }
        });
        child.on('error', (error) => {
          console.error('Spawn error:', error);
        });
      } catch (e) {
        console.error(e);
        throw e;
      }
    });
  }

  protected buildCommandLine({
    command,
    inputs,
    flags,
  }: CommandOptions): string {
    return `${command} ${this.buildInputs(inputs)} ${this.buildFlags(flags)}`;
  }

  protected buildInputs(inputs: string[] = []): string {
    return inputs.join(' ');
  }

  protected buildFlags(flags: Input[] = []): string {
    return flags
      .map(
        ({ name, value }) =>
          `--${name}${value !== undefined ? ' ' + value : ''}`,
      )
      .join(' ');
  }
}
