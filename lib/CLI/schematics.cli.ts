/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Input } from '../../commands';
import { EMOJIS } from '../ui';
import { colors, logger } from '../utils';
import { AbstractCli } from './abstract.cli';
import { CommandOptions, SchematicCommandOptions } from './cli.interfaces';

export class SchematicsCli extends AbstractCli {
  constructor() {
    super(`"${SchematicsCli.findClosestBinary()}"`);
  }

  static findClosestBinary(): string {
    try {
      return require.resolve(
        '@angular-devkit/schematics-cli/bin/schematics.js',
      );
    } catch (error) {
      logger.error(error.message, [
        `${colors.red(
          `${EMOJIS['BROKEN_HEART']} Schematics CLI doesn't installed, please execute:`,
        )} ${colors.green('npm i -g @angular-devkit/schematics-cli')}`,
      ]);
      process.exit(1);
    }
  }

  override buildCommandLine({
    collection,
    schematic,
    inputs,
    flags,
  }: SchematicCommandOptions): string {
    return `${collection}:${schematic} ${this.buildInputs(inputs)} ${this.buildFlags(flags)}`;
  }

  buildBlankCommand({ command, inputs, flags }: CommandOptions): string {
    return `${command} ${this.buildInputs(inputs)} ${this.buildFlags(flags)}`;
  }

  public getExecuteCommand(
    collection: string,
    schematic: string,
    inputs: string[] = [],
    flags: Input[] = [],
  ) {
    try {
      return this.buildCommandLine({
        collection,
        schematic,
        inputs,
        flags,
      });
    } catch (error) {
      logger.error(
        'Error when Project Builder was trying to execute the schematic',
        error.message,
      );
      process.exit(1);
    }
  }

  public getNewCommand(inputs: string[] = [], flags: Input[] = []): string {
    return this.buildBlankCommand({ command: 'blank', inputs, flags });
  }
}
