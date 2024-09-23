/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Subject } from 'rxjs';

export interface LevelInfo {
  collectionName: string;
  subject: Subject<void>; // A Subject that emits when the level is ready to proceed
  childCount: number; // Number of child nodes in this level
  completedChildren: number; // Number of children that have completed their tasks
  nodeIds: string[]; // The IDs of the nodes at this level
  isReady: boolean; // Whether this level is ready for execution
}

export interface DependencyInfo {
  name: string; // The name of the dependency (e.g., @angular/core)
  version: string; // The version of the dependency
  isGlobal: boolean; // Whether the dependency is installed globally or locally
  status: 'installed' | 'pending' | 'failed'; // The current installation status
  parentCollection: string; // Which collection this dependency belongs to
}

export interface InstallationState {
  collectionName: string; // The name of the collection
  isInstalled: boolean; // Whether the collection is installed or not
  installationTime?: Date; // Optional: Time of installation for logging purposes
  hasError?: boolean; // Optional: Tracks if there was an error during installation
}

export interface ErrorHandling {
  errorCode: string; // The error code or name
  errorMessage: string; // The error message for logging
  level: number; // The level where the error occurred
  nodeId?: string; // Optional: The node where the error occurred
}

export interface BuilderAdd {
  collectionName: string; // The collection to which the schematic belongs
  schematicName: string; // The name of the schematic
  dependencies: string[]; // List of dependencies that this schematic requires
}

export interface AsyncQueue {
  isAsync: boolean; // Whether the tasks are processed asynchronously
  tasks: Function[]; // List of async tasks to be managed
  processQueue(): void; // Method to process the tasks
}
