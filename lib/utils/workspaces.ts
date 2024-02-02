import { Input } from "../../commands";
import { Spinner } from "./spinner";
import { MESSAGES } from "../ui";
import { AngularCli, CLIFactory, NestJSCli, SchematicsCli } from "../CLI";
import { CLI } from "../CLI/cli.enum";
import { colors } from "./color";

export async function createWorkspace(
  frameworkName: string,
  inputs: Input[],
  flags: Input[],
  inputsExcluded: string[] = [],
  flagsExcluded: string[] = []
) {
  const inputsString = inputs
    .filter((input) => !inputsExcluded.some((i) => i === input.name))
    .map((input) => input.value as string);
  const flagsFiltered = flags.filter(
    (flag) => !flagsExcluded.some((f) => f === flag.name)
  );
  let spinner = new Spinner("workspace");
  try {
    const { value: name } = findInput(flags, "name");

    const cli = CliMap(name as string, inputsString, flagsFiltered);
    spinner.start(MESSAGES.CREATING_WORKSPACE(name as string));
    await cli[frameworkName]();
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


export const CliMap = (name: string, inputsString: string[], flagsFiltered: Input[]) => {
  return {
    Angular: () => {
      const angularCli: AngularCli = CLIFactory(CLI.ANGULAR) as AngularCli;
      return angularCli.runCommand(
        angularCli.getNgNewCommand([name, ...inputsString], flagsFiltered)
      );
    },
    NestJS: () => {
      const nestjsCli: NestJSCli = CLIFactory(CLI.NESTJS) as NestJSCli;
      return nestjsCli.runCommand(
        nestjsCli.getNewCommand([name, ...inputsString], flagsFiltered)
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

export function findInput(inputs: Input[], key: string) {
  return inputs.find((input) => input.name === key);
}
