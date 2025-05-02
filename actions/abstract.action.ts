/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Input } from '../commands'

export abstract class AbstractAction {
  public abstract handle(
    inputs?: Input[],
    options?: Input[],
    extraFlags?: string[],
  ): Promise<void>
}
