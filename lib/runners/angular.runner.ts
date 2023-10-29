import { AbstractRunner } from './abstract.runner';

export class AngularRunner extends AbstractRunner {
  constructor() {
    super(`node`, [`"${AngularRunner.findClosestSchematicsBinary()}"`]);
  }

  public static getModulePaths() {
    return module.paths;
  }

  public static findClosestSchematicsBinary(): string {
    try {
      return require.resolve('@angular/cli/bin/ng.js');
    } catch (e) {
      console.log(e);
      throw new Error("'ng' binary path could not be found!");
    }
  }
}
