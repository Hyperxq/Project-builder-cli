import { Input } from "../commands";
import { AbstractAction } from "./abstract.action";
import { AngularCli, CLIFactory, NestJSCli, SchematicsCli } from "../lib/CLI";
import { CLI } from "../lib/CLI/cli.enum";
import { colors, Spinner } from "../lib/utils";
import axios from "axios";
import { SchematicsException } from "@angular-devkit/schematics";
import { Collection } from "../lib/schematics";
import { dasherize } from "@angular-devkit/core/src/utils/strings";
import { CliOptions, Template } from "../interfaces/template.interface";
import { MESSAGES } from "../lib/ui";

export class CreateAction extends AbstractAction {
  public async handle(inputs: Input[], flags: Input[]) {
    await create(inputs, flags);
  }
}

const create = async (inputs: Input[] = [], flags: Input[] = []) => {
  const flagsExcluded = ["template-id", "name"];
  const inputsExcluded = ["template-id"];

  const schemaId = findInput(inputs, "template-id");


  // const dryRun = findInput(inputs, 'dry-run');
  //Read remote Template.
  const {
    json: workspaceStructure,
    cliOptions,
    createBy,
    name
  } = await fetchData(schemaId.value as string);

  console.log(MESSAGES.WELCOME(name, createBy));

  const { cli: frameworkName, options } = cliOptions as CliOptions;

  const workspaceInputs = Object.entries(options).map((value) => ({
    name: value[0],
    value: value[1]
  }));

  await createWorkspace(
    frameworkName,
    inputs,
    [...flags, ...workspaceInputs],
    inputsExcluded,
    flagsExcluded
  );

  const buildFlags: Input[] = [
    { name: "install-collection", value: true },
    { name: "add-collections", value: true },
    {
      name: "name",
      value: options.name
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
      `./${dasherize(options.name as string)}`
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
  templateId: string
): Promise<Template> {
  let spinner = new Spinner();
  try {

    spinner.start(
      colors.blue(`Validating template-id: ${colors.bold(templateId)}`)
    );
    const { data } = await axios.get<Template>(
      `https://project-builder-backend-production.up.railway.app/user-templates?id=${templateId}`
    );
    if (!data) {
      spinner.stop();
      throw new Error(
        `The template-id ${colors.bold(colors.red(templateId))} is ${colors.red(
          "not valid"
        )} or something happened wrong`
      );
    }
    const { cliOptions } = data;
    const { options } = cliOptions as CliOptions;
    const workspaceName = options.name;

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
    const { value } = findInput(flags, "name");
    spinner.start(MESSAGES.CREATING_WORKSPACE(value as string));

    const CliMap = (inputsString: string[], flagsFiltered: Input[]) => {
      return {
        Angular: () => {
          const angularCli: AngularCli = CLIFactory(CLI.ANGULAR) as AngularCli;
          return angularCli.runCommand(
            angularCli.getNgNewCommand([value as string, ...inputsString], flagsFiltered)
          );
        },
        NestJS: () => {
          const nestjsCli: NestJSCli = CLIFactory(CLI.NESTJS) as NestJSCli;
          return nestjsCli.runCommand(
            nestjsCli.getNewCommand([value as string, ...inputsString], flagsFiltered)
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
        colors.red(`something happen when we try to create a new workspace, ${e?.message ?? e}`)
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
