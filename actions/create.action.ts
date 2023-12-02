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
  console.log(inputs);
  const flagsExcluded = ['template-id'];
  const inputsExcluded = ['template-id'];

  const schemaId: Input | undefined = findInput(inputs, 'template-id');

  const { value: workspaceName }: Input | undefined = findInput(
    inputs,
    'workspace-name',
  );

  const inputsString = inputs
    .filter((input) => !inputsExcluded.some((i) => i === input.name))
    .map((input) => input.value as string);
  const flagsFiltered = flags.filter(
    (flag) => !flagsExcluded.some((f) => f === flag.name),
  );

  try {
    //1. Create workspace, call angular cli.
    const cli = CLIFactory(CLI.ANGULAR) as AngularCli;
    await cli.runCommand(cli.getNgNewCommand(inputsString, flagsFiltered));
  } catch (e) {
    throw new Error(
      colors.bold(
        colors.red(`something happen when we try to create a new workspace`),
      ),
    );
  }

  //2. Read JSON remote file.
  const workspaceStructure = await fetchData(
    schemaId.value as string,
    workspaceName as string,
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
      `./${dasherize(workspaceName as string)}`,
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
  templateId: string,
  workspaceName: string,
): Promise<string> {
  try {
    const { data } = await axios.get(
      `https://angular-builder-backend-production.up.railway.app/templates/json?id=${templateId}`,
    );
    if (!data) {
      throw new SchematicsException(
        colors.bold(colors.red(`The schema-id ${templateId} is not valid.`)),
      );
    }

    return replaceDefaultProject(data, workspaceName);
  } catch (error) {
    throw new SchematicsException(`Error fetching data: ${error.message}`);
  }
}

function replaceDefaultProject(data: string, workspaceName: string) {
  const regex = /(\[DEFAULT-PROJECT])/gm;
  const jsonString = JSON.stringify(data);

  return Buffer.from(jsonString.replace(regex, workspaceName)).toString(
    'base64',
  );
}

function findInput(inputs: Input[], key: string) {
  return inputs.find((input) => input.name === 'schemaId');
}
