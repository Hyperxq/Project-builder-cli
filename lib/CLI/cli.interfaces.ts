/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Input } from '../../commands';

export interface CommandOptions {
  command?: string;
  inputs: string[];
  flags: Input[];
}

export interface SchematicCommandOptions extends CommandOptions {
  collection: string;
  schematic: string;
}
