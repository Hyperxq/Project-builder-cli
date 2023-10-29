import { AbstractRunner } from '../runners';
import { AbstractCollection } from './abstract.collection';
import { SchematicOption } from './schematic.option';
import { Schematic } from './schematic';

export class AngularCollection extends AbstractCollection {
  //Generate commands
  private static schematics: Schematic[] = [
    {
      name: 'application',
      alias: 'app',
      description: 'Create an Angular application.',
    },
    {
      name: 'service-worker',
      alias: '',
      description: 'Initializes a service worker setup.',
    },
    {
      name: 'class',
      alias: 'cl',
      description: 'Create a class.',
    },
    {
      name: 'component',
      alias: 'c',
      description: 'Create an Angular component.',
    },
    {
      name: 'directive',
      alias: 'd',
      description: 'Create an Angular directive.',
    },
    {
      name: 'enum',
      alias: 'e',
      description: 'Create an enumeration.',
    },
    {
      name: 'guard',
      alias: 'g',
      description: 'Create a guard.',
    },
    {
      name: 'resolver',
      alias: 'r',
      description: 'Create a resolver.',
    },
    {
      name: 'interceptor',
      alias: '',
      description: 'Create an interceptor.',
    },
    {
      name: 'interface',
      alias: 'i',
      description: 'Create an interface.',
    },
    {
      name: 'module',
      alias: 'm',
      description: 'Create an Angular module.',
    },
    {
      name: 'pipe',
      alias: 'p',
      description: 'Create an Angular pipe.',
    },
    {
      name: 'service',
      alias: 's',
      description: 'Create an Angular service.',
    },
    {
      name: 'app-shell',
      alias: '',
      description: 'Create an application shell.',
    },
    {
      name: 'library',
      alias: 'lib',
      description: 'Generate a library project for Angular..',
    },
    {
      name: 'web-worker',
      alias: '',
      description: 'Create a Web Worker.',
    },
    {
      name: 'environments',
      alias: '',
      description: 'Generate project environment files.',
    },
    {
      name: 'config',
      alias: '',
      description: 'Generates a configuration file.',
    },
  ];

  constructor(runner: AbstractRunner) {
    super('@schematics/angular', runner);
  }

  public async execute(name: string, options: SchematicOption[]) {
    const schematic: string = this.validate(name);
    await super.execute(schematic, options);
  }

  public getSchematics(): Schematic[] {
    return AngularCollection.schematics.filter(
      (item) => item.name !== 'angular-app',
    );
  }

  private validate(name: string) {
    const schematic = AngularCollection.schematics.find(
      (s) => s.name === name || s.alias === name,
    );

    if (schematic === undefined || schematic === null) {
      throw new Error(
        `Invalid schematic "${name}". Please, ensure that "${name}" exists in this collection.`,
      );
    }
    return schematic.name;
  }
}
