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

export interface SchematicCollection {
  $schema: string;
  schematics: Schematics;
}

export interface Schematics {
  [key: string]: Schematic;
}

export interface Schematic {
  description: string;
  factory: string;
  hidden?: boolean;
  schema?: string;
  aliases?: string[];
  schematicName?: string;
}

export interface JsonSchema {
  $schema: string;
  $id: string;
  title: string;
  type: string;
  properties: Properties;
}

export interface Properties {
  [key: string]: PropertyDefinition;
}

interface BaseProperty {
  type: string;
  description?: string;
  visible?: boolean;
  default?: any;
  xPrompt?: string;
}

interface StringProperty extends BaseProperty {
  type: 'string';
}

interface EnumProperty extends BaseProperty {
  type: 'string';
  enum: string[];
}

interface NumberProperty extends BaseProperty {
  type: 'number';
  minimum?: number;
  maximum?: number;
}

interface BooleanProperty extends BaseProperty {
  type: 'boolean';
}

interface ObjectProperty extends BaseProperty {
  type: 'object';
  properties: { [key: string]: PropertyDefinition };
  required?: string[];
}

interface ArrayProperty extends BaseProperty {
  type: 'array';
  items: PropertyDefinition;
}

interface MultiTypeProperty extends BaseProperty {
  oneOf: PropertyDefinition[];
}

interface ReferenceProperty extends BaseProperty {
  $ref: string;
}

type PropertyDefinition =
  | StringProperty
  | EnumProperty
  | NumberProperty
  | BooleanProperty
  | ObjectProperty
  | ArrayProperty
  | MultiTypeProperty
  | ReferenceProperty;
