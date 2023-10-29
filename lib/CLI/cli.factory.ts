import { CLI } from './cli.enum';
import { AngularCli } from './angular.cli';
import { SchematicsCli } from './schematics.cli';
import { NestJSCli } from './nestjs.cli';

export function CLIFactory(cli: CLI = CLI.SCHEMATICS) {
  switch (cli) {
    case CLI.ANGULAR:
      return new AngularCli();
    case CLI.NESTJS:
      return new NestJSCli();
    case CLI.SCHEMATICS:
      return new SchematicsCli();
  }
}
