import { Input } from '../commands';
import { AbstractAction } from './abstract.action';
import { Collection } from '../lib/schematics';
import { colors } from '../lib/utils';

export class GenerateAction extends AbstractAction {
  public async handle(inputs: Input[], options: Input[]) {
    await generateFiles(inputs.concat(options));
  }
}

const generateFiles = async (inputs: Input[]) => {
  const collectionOption =
    (inputs.find((option) => option.name === 'collection')!.value as string) ??
    Collection.ANGULAR;
  const schematic = inputs.find((option) => option.name === 'schematic')!
    .value as string;
  const flat = inputs.find((option) => option.name === 'flat');
  const name = inputs.find((option) => option.name === 'name');
  const path = inputs.find((option) => option.name === 'path');
  const dryRun = inputs.find((option) => option.name === 'dry-run');
  const skipImport = inputs.find((option) => option.name === 'skip-import');

  //TODO: From here we need to split the execution depends on the framework.
  // Here is the collection factory
  // The factory only checks the schematics that the library has.
  // TODO: We need to support another frameworks
  // const collection: AbstractCollection =
  //   CollectionFactory.create(collectionOption);
  //
  // // const relativePath = getRelativePath();
  // const schematicOptions: SchematicOption[] = mapSchematicOptions(inputs);

  try {
    // const schematicInput = inputs.find((input) => input.name === 'schematic');
    // if (!schematicInput) {
    //   throw new Error('You need a schematic name to execute this command');
    // }
    //
    // await collection.execute(schematicInput.value as string, schematicOptions);
  } catch (error) {
    if (error && (error as { message: string }).message) {
      console.error(colors.red((error as { message: string }).message));
    }
  }
};

// const mapSchematicOptions = (inputs: Input[]): SchematicOption[] => {
//   const excludedInputNames = ['schematic', 'spec', 'flat', 'specFileSuffix'];
//   const options: SchematicOption[] = [];
//   inputs.forEach((input) => {
//     if (!excludedInputNames.includes(input.name) && input.value !== undefined) {
//       options.push(new SchematicOption(input.name, input.value));
//     }
//   });
//   return options;
// };
