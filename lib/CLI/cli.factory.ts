/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { AngularCli } from './angular.cli'
import { CLI } from './cli.enum'
import { NestJSCli } from './nestjs.cli'
import { SchematicsCli } from './schematics.cli'

export function CLIFactory(cli: CLI = CLI.SCHEMATICS) {
  switch (cli) {
    case CLI.ANGULAR:
      return new AngularCli()
    case CLI.NESTJS:
      return new NestJSCli()
    case CLI.SCHEMATICS:
      return new SchematicsCli()
  }
}
