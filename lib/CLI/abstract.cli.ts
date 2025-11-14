import { SpawnOptions } from 'child_process';
import { Input } from '../commands';
import { spawnAsync } from '../utils';
import { CommandOptions } from './cli.interfaces';

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

    await spawnAsync(`node`, [this.binary, ...args], options, collect);
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
    return (
      flags
        // .filter((ff) => !(typeof ff.value === 'boolean' && !ff.value))
        // .map((ff) => {
        //   ff.value = typeof ff.value !== 'boolean' ? ff.value : undefined;

        //   return ff;
        // })
        .map(
          ({ name, value }) =>
            `--${name}${value !== undefined ? '=' + value : ''}`,
        )
        .join(' ')
    );
  }
}
