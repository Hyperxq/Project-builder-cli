import { colors } from '../utils';
import { Runner } from './runner';
import { SchematicRunner } from './schematic.runner';
import { AngularRunner } from './angular.runner';
import { NestjsRunner } from './nestjs.runner';
import { NpmRunner } from './npm.runner';
import { YarnRunner } from './yarn.runner';
import { PnpmRunner } from './pnpm.runner';

export class RunnerFactory {
  public static create(runner: Runner) {
    switch (runner) {
      case Runner.SCHEMATIC:
        return new SchematicRunner();

      case Runner.AngularCLI:
        return new AngularRunner();

      case Runner.NestjsCLI:
        return new NestjsRunner();

      case Runner.NPM:
        return new NpmRunner();

      case Runner.YARN:
        return new YarnRunner();

      case Runner.PNPM:
        return new PnpmRunner();

      default:
        console.info(colors.yellow(`[WARN] Unsupported runner: ${runner}`));
        return new SchematicRunner();
    }
  }
}
