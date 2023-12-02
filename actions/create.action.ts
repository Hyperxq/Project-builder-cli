import { Input } from '../commands';
import { AbstractAction } from './abstract.action';
import { AngularCli, CLIFactory, NestJSCli, SchematicsCli } from '../lib/CLI';
import { CLI } from '../lib/CLI/cli.enum';
import { colors } from '../lib/utils';
import axios from 'axios';
import { SchematicsException } from '@angular-devkit/schematics';
import { Collection } from '../lib/schematics';
import { dasherize } from '@angular-devkit/core/src/utils/strings';
import { Template } from '../interfaces/template.interface';
import { FrameworksEnum } from '../enums/frameworks.enum';

export class CreateAction extends AbstractAction {
  public async handle(inputs: Input[], flags: Input[]) {
    await create(inputs, flags);
  }
}

const create = async (inputs: Input[] = [], flags: Input[] = []) => {
  console.log(inputs);
  const flagsExcluded = ['template-id'];
  const inputsExcluded = ['template-id'];

  const schemaId = findInput(inputs, 'template-id');

  const { value: workspaceName } = findInput(inputs, 'workspace-name');

  //Read remote Template.
  const { json: workspaceStructure, framework } = await fetchData(
    schemaId.value as string,
    workspaceName as string,
  );

  const { name: frameworkName } = framework;

  await createWorkspace(
    frameworkName,
    inputs,
    flags,
    inputsExcluded,
    flagsExcluded,
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

async function fetchData(
  templateId: string,
  workspaceName: string,
): Promise<Template> {
  try {
    const { data } = await axios.get<Template>(
      `https://angular-builder-backend-production.up.railway.app/templates?id=${templateId}`,
    );
    if (!data) {
      throw new SchematicsException(
        colors.bold(colors.red(`The schema-id ${templateId} is not valid.`)),
      );
    }

    data.json = replaceDefaultProject(data.json, workspaceName);
    return data;
  } catch (error) {
    throw new SchematicsException(`Error fetching data: ${error.message}`);
  }
}

async function createWorkspace(
  frameworkName: string,
  inputs: Input[],
  flags: Input[],
  inputsExcluded: string[],
  flagsExcluded: string[],
) {
  const inputsString = inputs
    .filter((input) => !inputsExcluded.some((i) => i === input.name))
    .map((input) => input.value as string);
  const flagsFiltered = flags.filter(
    (flag) => !flagsExcluded.some((f) => f === flag.name),
  );
  console.log(frameworkName);
  try {
    //1. Create workspace
    switch (frameworkName) {
      //call angular cli.
      case FrameworksEnum.ANGULAR:
        let angularCli: AngularCli = CLIFactory(CLI.ANGULAR) as AngularCli;
        await angularCli.runCommand(
          angularCli.getNgNewCommand(inputsString, flagsFiltered),
        );
        break;
      case FrameworksEnum.NESTJS:
        const nestjsCli: NestJSCli = CLIFactory(CLI.NESTJS) as NestJSCli;
        await nestjsCli.runCommand(
          nestjsCli.getNewCommand(inputsString, flagsFiltered),
        );
        break;
      case FrameworksEnum.SCHEMATICS:
        const schematicCli = CLIFactory(CLI.SCHEMATICS) as SchematicsCli;
        await schematicCli.runCommand(
          schematicCli.getNewCommand(inputsString, flagsFiltered),
        );
        break;
      default:
    }
  } catch (e) {
    throw new Error(
      colors.bold(
        colors.red(`something happen when we try to create a new workspace`),
      ),
    );
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
  return inputs.find((input) => input.name === key);
}
