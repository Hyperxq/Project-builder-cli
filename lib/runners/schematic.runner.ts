import { AbstractRunner } from './abstract.runner';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export class SchematicRunner extends AbstractRunner {
  constructor() {
    super(`node`, [`"${SchematicRunner.findClosestSchematicsBinary()}"`]);
  }

  public static getModulePaths() {
    return module.paths;
  }

  public static findClosestSchematicsBinary(): string {
    try {
      // return require.resolve(
      //   '@angular-devkit/schematics-cli/bin/schematics.js',
      //   { paths: this.getModulePaths() },
      // );

      return require.resolve(
        '@angular-devkit/schematics-cli/bin/schematics.js',
      );
    } catch (e) {
      console.log(e);
      throw new Error("'schematics' binary path could not be found!");
    }
  }
}
