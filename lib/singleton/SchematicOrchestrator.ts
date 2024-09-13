/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Subject } from 'rxjs';
import { DependencyInfo, LevelInfo } from '../../interfaces';
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export class SchematicOrchestrator {
  static #instance: SchematicOrchestrator;
  static #id: string;
  static #currentLevel: number;
  static #conflictVersionResolution: 'latest' | 'oldest' | 'skip';
  static #errorState: boolean;
  static #levelsInfo: Map<number, LevelInfo>;
  static #processWasCompleted: Subject<void>;
  static #dependenciesInstalled: Map<string, DependencyInfo>;
  static #installationState: Map<string, boolean>;

  private constructor() {}

  public static get instance(): SchematicOrchestrator {
    if (!SchematicOrchestrator.#instance) {
      SchematicOrchestrator.#instance = new SchematicOrchestrator();
    }

    return SchematicOrchestrator.#instance;
  }

  public startInstallationProcess(collectionName: string): Subject<void> {
    return SchematicOrchestrator.#processWasCompleted;
  }

  public notifyExecutionCompletion(nodeId: string): void {}

  public finalizeProcess(nodeId: string): void {
    throw new Error('Method not implemented.');
  }

  private uninstallDependencies(level: number): void {
    throw new Error('Method not implemented.');
  }

  private installDependencies(level: number): void {
    throw new Error('Method not implemented.');
  }

  private executeBuilderAdds(level: number): void {
    throw new Error('Method not implemented.');
  }

  private executeBuilderAdd(level: number): void {
    throw new Error('Method not implemented.');
  }

  private trackInstallationProgress(level: number, dependency: string): void {
    throw new Error('Method not implemented.');
  }

  private handleVersionConflict(dependencyName: string, version: string): void {
    throw new Error('Method not implemented.');
  }

  private checkDependenciesInstalled(collection: string): boolean {
    throw new Error('Method not implemented.');
  }

  private startExecutionProcess(): void {
    throw new Error('Method not implemented.');
  }

  private rollback(level: number): void {
    throw new Error('Method not implemented.');
  }

  private errorHandling(error: Error, level: number): void {
    throw new Error('Method not implemented.');
  }

  private clearLevelData(level: number): void {
    throw new Error('Method not implemented.');
  }

  private manageAsyncQueue(): void {
    throw new Error('Method not implemented.');
  }

  private logState(level: number): void {
    throw new Error('Method not implemented.');
  }
}
