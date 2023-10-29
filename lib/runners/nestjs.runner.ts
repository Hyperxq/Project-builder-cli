import { AbstractRunner } from './abstract.runner';

export class NestjsRunner extends AbstractRunner {
  constructor() {
    super(`node`, [`"${NestjsRunner.findClosestSchematicsBinary()}"`]);
  }

  public static getModulePaths() {
    return module.paths;
  }

  public static findClosestSchematicsBinary(): string {
    try {
      return require.resolve('@nestjs/cli/bin/nestjs.js');
    } catch (e) {
      console.log(e);
      throw new Error("'nestjs' binary path could not be found!");
    }
  }
}
