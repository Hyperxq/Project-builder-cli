/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

interface IWorkspaceStructure {
  globalSettings?: {
    [key: string]: {
      [prop: string]: string;
    };
  };
  projects: {
    [key: string]: {
      [prop: string]: {
        [prop: string]: any;
      };
    };
  };
}

export type WorkspaceStructure = IWorkspaceStructure & {
  [key: string]: {
    [prop: string]: any;
  };
};

export interface BuildOptions {
  base64String?: string;
  workspaceStructure: WorkspaceStructure;
  installCollection: boolean;
  addCollections: boolean;
  unInstallCollection?: boolean;
  name?: string;
}
