import { colors } from '../utils';
import { Runner } from './runner';
import { NpmRunner } from './npm.runner';
import { PnpmRunner } from './pnpm.runner';
import { YarnRunner } from './yarn.runner';
import { SchematicRunner } from './schematic.runner';

export class RunnerFactory {
  public static create(runner: Runner) {
    switch (runner) {
      case Runner.SCHEMATIC:
        return new SchematicRunner();
      case Runner.NPM:
        return new NpmRunner();

      case Runner.YARN:
        return new YarnRunner();

      case Runner.PNPM:
        return new PnpmRunner();

      default:
        console.info(colors.yellow(`[WARN] Unsupported runner: ${runner}`));
    }
  }
}
