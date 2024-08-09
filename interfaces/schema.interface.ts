/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export interface SchematicsCollectionSchema {
  extends?: string | string[];
  schematics: {
    [key: string]: {
      aliases?: string[];
      factory: string;
      description: string;
      extends?: string;
      schema?: string;
      hidden?: boolean;
      private?: boolean;
    };
  };
  version?: string;
}

export interface SchematicDependency {
  temporal?: boolean;
  type?: 'dev' | 'peer' | 'optional';
  version?: string;
  overwrite?: boolean;
  registry?: string;
}
