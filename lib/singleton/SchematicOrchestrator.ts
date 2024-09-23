/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Observable, Subject } from 'rxjs';
import { v4 } from 'uuid';
import { AddAction } from '../../actions/add.action';
import { Input } from '../../commands';
import { DependencyInfo, LevelInfo } from '../../interfaces';

export class SchematicOrchestrator {
  static #instance: SchematicOrchestrator;
  static #id: string;
  static #currentLevel: number = 0;
  // TODO: add as a command option.
  static #conflictVersionResolution: 'latest' | 'oldest' | 'skip' = 'skip';
  static #errorState: boolean = false;
  static #levelsInfo: Map<number, LevelInfo>;
  static #processWasCompleted: Subject<void> = new Subject<void>();
  static #notifyCompletation: Subject<string> = new Subject<string>();
  static #dependenciesInstalled: Map<string, DependencyInfo>;
  static #installationState: Map<string, boolean>;

  private constructor() {}

  //* Only for setting all related with the collection and level.
  public static startInstallation(collectionName: string): {
    id: string;
    waitInstallationFinished: Observable<string>; // * the subject for this builder-add
    notifyExecutionCompletion: () => void;
  } {
    const id = v4();

    if (!SchematicOrchestrator.#instance) {
      SchematicOrchestrator.#id = id;
    }

    return {
      id,
      notifyExecutionCompletion: () => this.notifyExecutionCompletion(id),
      waitInstallationFinished: SchematicOrchestrator.#notifyCompletation,
    };
  }

  static startProcess(inputs: Input[], flags: Input[]): Subject<void> {
    /*
     * We need to start the process here:
     * Call the builder-add with all the flag and inputs needed.
     *      We know that the builder add will try to get an instance starting all the process.
     * When the first builder-add call back we will set this as a root
     */
    const action = new AddAction();
    action.handle(inputs, flags);

    return SchematicOrchestrator.#processWasCompleted;
  }

  static notifyExecutionCompletion(nodeId: string): void {}

  public finalizeProcess(nodeId: string): void {
    throw new Error('Method not implemented.');
  }

  public initInstallation(id: string) {}

  private uninstallDependencies(level: number): void {
    throw new Error('Method not implemented.');
  }

  private installDependencies(level: number): void {
    throw new Error('Method not implemented.');
  }

  private initLevel(
    levelInfo: Pick<LevelInfo, 'collectionName' | 'childCount' | 'nodeIds'>,
  ) {
    SchematicOrchestrator.#levelsInfo.set(SchematicOrchestrator.#currentLevel, {
      ...levelInfo,
      subject: new Subject<void>(),
      completedChildren: 0,
      isReady: false,
    });
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

  private cleanState() {
    SchematicOrchestrator.#instance = undefined;
    SchematicOrchestrator.#id = undefined;
  }
}
