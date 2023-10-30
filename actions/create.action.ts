import { Input } from '../commands';
import { AbstractAction } from './abstract.action';
import { AngularCli, CLIFactory, SchematicsCli } from '../lib/CLI';
import { CLI } from '../lib/CLI/cli.enum';
import { colors } from '../lib/utils';
import axios from 'axios';
import { SchematicsException } from '@angular-devkit/schematics';
import { Collection } from '../lib/schematics';
import { dasherize } from '@angular-devkit/core/src/utils/strings';

export class CreateAction extends AbstractAction {
  public async handle(inputs: Input[], flags: Input[]) {
    await create(inputs, flags);
  }
}

const create = async (inputs: Input[], flags: Input[]) => {
  const flagsExclude = ['framework', 'schemaId'];
  const inputsExclude = ['schemaId'];
  console.log('inputs', inputs);
  const cli = CLIFactory(CLI.ANGULAR) as AngularCli;
  const schemaId: Input | undefined = inputs.find(
    (input) => input.name === 'schemaId',
  );
  const inputsString = inputs
    .filter((input) => !inputsExclude.some((i) => i === input.name))
    .map((input) => input.value as string);
  const flagsFiltered = flags.filter(
    (flag) => !flagsExclude.some((f) => f === flag.name),
  );
  try {
    //1. Create workspace, call angular cli.
    await cli.runCommand(cli.getNgNewCommand(inputsString, flagsFiltered));
  } catch (e) {
    throw new Error(
      colors.bold(
        colors.red(`something happen when we try to create a new workspace`),
      ),
    );
  }

  //2. Read JSON remote file.
  const workspaceName = inputs.find((i) => i.name === 'workspaceName')!
    .value! as string;
  const workspaceStructure = await fetchData(
    schemaId.value as string,
    workspaceName,
  );
  const buildFlags: Input[] = [
    { name: 'install-collection', value: true },
    { name: 'add-collections', value: true },
    {
      name: 'name',
      value: workspaceName,
    },
    { name: 'base64-string', value: workspaceStructure },
  ];

  const schematicsCLI = CLIFactory(CLI.SCHEMATICS) as SchematicsCli;
  try {
    //3. Execute build schematic, call angular-builder schematic.
    await schematicsCLI.runCommand(
      schematicsCLI.getExecuteCommand(
        Collection.ANGULARBUILDER,
        'build',
        [],
        buildFlags,
      ),
      false,
      `./${dasherize(workspaceName)}`,
    );
  } catch (e) {
    throw new Error(
      colors.bold(
        colors.red(`something happen when we try to build the schema json`),
      ),
    );
  }
};

async function fetchData<T>(
  schemaId: string,
  workspaceName: string,
): Promise<string> {
  try {
    const { data } = await axios.get(
      `https://angular-builder-backend-production.up.railway.app/schemas/json?id=${schemaId}`,
    );
    if (!data) {
      throw new SchematicsException(
        colors.bold(colors.red(`The schema-id ${schemaId} is not valid.`)),
      );
    }
    const regex = /(\[DEFAULT-PROJECT])/gm;
    const jsonString = JSON.stringify(data);

    return Buffer.from(jsonString.replace(regex, workspaceName)).toString(
      'base64',
    );
  } catch (error) {
    throw new SchematicsException(`Error fetching data: ${error.message}`);
  }
}
