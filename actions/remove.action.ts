/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Input } from '../commands';
import { AbstractAction } from './abstract.action';

export class RemoveAction extends AbstractAction {
  public async handle(inputs: Input[], flags: Input[]) {
    await addSchematic(inputs, flags);
  }
}

export function addSchematic(inputs: Input[], flags: Input[]) {}
