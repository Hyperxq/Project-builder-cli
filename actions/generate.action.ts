import { Input } from "../commands";
import { AbstractAction } from "./abstract.action";
import { Collection } from "../lib/schematics";
import { colors, findInput } from "../lib/utils";
import { CLIFactory, SchematicsCli } from "../lib/CLI";
import { CLI } from "../lib/CLI/cli.enum";

export class GenerateAction extends AbstractAction {
  public async handle(inputs: Input[], flags: Input[]) {
    await generateFiles(inputs, flags);
  }
}

const generateFiles = async (inputs: Input[] = [], flags: Input[] = []) => {
  try {
    const collection =
      (findInput(inputs, "collection")?.value as string) ??
      Collection.ANGULAR;
    const schematic = findInput(inputs, "schematic")?.value as string;

    const schematicCli = CLIFactory(CLI.SCHEMATICS) as SchematicsCli;

    await schematicCli.runCommand(
      schematicCli.getExecuteCommand(collection, schematic, [], flags)
    );
  } catch (error) {
    if (error && (error as { message: string }).message) {
      console.error(colors.red((error as { message: string }).message));
    }
  }
};

