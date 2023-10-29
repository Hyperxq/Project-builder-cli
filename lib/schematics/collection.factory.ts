import { Collection } from './collection';
import { AbstractCollection } from './abstract.collection';
import { Runner, RunnerFactory, SchematicRunner } from '../runners';
import { NestCollection } from './nest.collection';
import { AngularCollection } from './angular.collection';
import { CustomCollection } from './custom.collection';

export class CollectionFactory {
  public static create(
    collection: Collection | string,
    runner: Runner = Runner.SCHEMATIC,
  ): AbstractCollection {
    const schematicRunner = RunnerFactory.create(runner) as SchematicRunner;

    switch (collection) {
      case Collection.NESTJS:
        return new NestCollection(schematicRunner);
      case Collection.ANGULAR:
        return new AngularCollection(schematicRunner);
      default:
        return new CustomCollection(collection, schematicRunner);
    }
  }
}
