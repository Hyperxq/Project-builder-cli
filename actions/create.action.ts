import { Input } from "../commands";
import { AbstractAction } from "./abstract.action";
import { AngularCli, CLIFactory, NestJSCli, SchematicsCli } from "../lib/CLI";
import { CLI } from "../lib/CLI/cli.enum";
import { colors, Spinner } from "../lib/utils";
import axios from "axios";
import { SchematicsException } from "@angular-devkit/schematics";
import { Collection } from "../lib/schematics";
import { dasherize } from "@angular-devkit/core/src/utils/strings";
import { Template } from "../interfaces/template.interface";
import { MESSAGES } from "../lib/ui";

export class CreateAction extends AbstractAction {
  public async handle(inputs: Input[], flags: Input[]) {
    await create(inputs, flags);
  }
}

const create = async (inputs: Input[] = [], flags: Input[] = []) => {
  const flagsExcluded = ["template-id"];
  const inputsExcluded = ["template-id"];

  const schemaId = findInput(inputs, "template-id");

  const { value: workspaceName } = findInput(inputs, "workspace-name");

  // const dryRun = findInput(inputs, 'dry-run');
  //Read remote Template.
  const {
    json: workspaceStructure,
    framework,
    createBy,
    name
  } = await fetchData(schemaId.value as string, workspaceName as string);

  console.log(MESSAGES.WELCOME(name, createBy));

  const { name: frameworkName } = framework;

  await createWorkspace(
    frameworkName,
    inputs,
    flags,
    inputsExcluded,
    flagsExcluded
  );

  const buildFlags: Input[] = [
    { name: "install-collection", value: true },
    { name: "add-collections", value: true },
    {
      name: "name",
      value: workspaceName
    },
    { name: "base64-string", value: workspaceStructure }
  ];

  const schematicsCLI = CLIFactory(CLI.SCHEMATICS) as SchematicsCli;
  try {
    //3. Execute build schematic, call angular-builder schematic.
    await schematicsCLI.runCommand(
      schematicsCLI.getExecuteCommand(
        Collection.ANGULARBUILDER,
        "build",
        [],
        buildFlags
      ),
      false,
      `./${dasherize(workspaceName as string)}`
    );
  } catch (e) {
    throw new Error(
      `${colors.bold(
        colors.red(`something happen when we try to build the schema json:`)
      )} ${e.message}`
    );
  }
};

async function fetchData(
  templateId: string,
  workspaceName: string
): Promise<Template> {
  let spinner = new Spinner();
  try {
    spinner.start(
      colors.blue(`Validating template-id: ${colors.bold(templateId)}`)
    );
    const { data } = await axios.get<Template>(
      `https://project-builder-backend-production.up.railway.app/templates?id=${templateId}`
    );
    if (!data) {
      spinner.stop();
      throw new Error(
        `The template-id ${colors.bold(colors.red(templateId))} is ${colors.red(
          "not valid"
        )} or something happened wrong`
      );
    }

    data.json = replaceDefaultProject(data.json, workspaceName);
    spinner.succeed(
      `The template-id ${colors.bold(
        colors.green(templateId)
      )} is ${colors.green("valid")}`
    );
    return data;
  } catch (error) {
    spinner.stop();
    throw new SchematicsException(error);
  }
}

async function createWorkspace(
  frameworkName: string,
  inputs: Input[],
  flags: Input[],
  inputsExcluded: string[],
  flagsExcluded: string[]
) {
  const inputsString = inputs
    .filter((input) => !inputsExcluded.some((i) => i === input.name))
    .map((input) => input.value as string);
  const flagsFiltered = flags.filter(
    (flag) => !flagsExcluded.some((f) => f === flag.name)
  );
  let spinner = new Spinner();
  try {
    const { value } = findInput(inputs, "workspace-name");
    spinner.start(MESSAGES.CREATING_WORKSPACE(value as string));

    const CliMap = (inputsString: string[], flagsFiltered: Input[]) => {
      return {
        Angular: () => {
          const angularCli: AngularCli = CLIFactory(CLI.ANGULAR) as AngularCli;
          return angularCli.runCommand(
            angularCli.getNgNewCommand(inputsString, flagsFiltered)
          );
        },
        NestJS: () => {
          const nestjsCli: NestJSCli = CLIFactory(CLI.NESTJS) as NestJSCli;
          return nestjsCli.runCommand(
            nestjsCli.getNewCommand(inputsString, flagsFiltered)
          );
        },
        Schematics: () => {
          const schematicCli = CLIFactory(CLI.SCHEMATICS) as SchematicsCli;
          return schematicCli.runCommand(
            schematicCli.getNewCommand(inputsString, flagsFiltered)
          );
        }
      };
    };
    spinner.stop();
    const cli = CliMap(inputsString, flagsFiltered);
    await cli[frameworkName]();
    spinner.start(MESSAGES.CREATING_WORKSPACE(value as string));
    spinner.succeed(MESSAGES.WORKSPACE_CREATED);
  } catch (e) {
    spinner.stop();
    throw new Error(
      colors.bold(
        colors.red(`something happen when we try to create a new workspace`)
      )
    );
  }
}

function replaceDefaultProject(data: string, workspaceName: string) {
  const regex = /(\[DEFAULT-PROJECT])/gm;
  const jsonString = JSON.stringify(data);

  return Buffer.from(jsonString.replace(regex, workspaceName)).toString(
    "base64"
  );
}

function findInput(inputs: Input[], key: string) {
  return inputs.find((input) => input.name === key);
}
