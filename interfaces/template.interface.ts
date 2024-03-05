/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { VerificationState } from '../enums/verification-state.enum';

export interface Template {
  id: string;
  name: string;
  createBy: string;
  usedCount: number;
  username: string;
  json: string;
  userTemplateVerificationState: VerificationState;
  cliOptions: CliOptions;
}

export enum CLI {
  Angular = 'Angular',
  Nestjs = 'Nestjs',
  SCHEMATICS = 'SCHEMATICS',
}

export interface CliOptions {
  cli: CLI;
  options: { [p: string]: any };
}
