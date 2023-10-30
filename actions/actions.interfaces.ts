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
