/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export interface Reader {
  list(): string[] | Promise<string[]>

  read(name: string): string | Promise<string>

  readAnyOf(filenames: string[]): string | Promise<string | undefined>
}
