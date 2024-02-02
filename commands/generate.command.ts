import { AbstractCommand } from "./abstract.command";
import { Command } from "commander";
import { Input } from "./command.input.interface";

export class GenerateCommand extends AbstractCommand {
  public async load(program: Command): Promise<void> {
    program
      .command("generate <schematic>")
      .alias("g")
      .description("Execute any schematics no matter the workspace")
      .option(
        "-d, --dry-run",
        "Report actions that would be taken without writing out results.",
        false
      )
      .option(
        "-c, --collection [collectionName]",
        "Schematics collection to use."
      )
      .allowUnknownOption()
      .action(
        async (
          schematic: string,
          command: { [key: string]: any }
        ) => {
          const { dryRun, flat } = command;
          const collection = command?.collection;

          const options: Input[] = [];

          options.push({ name: "dry-run", value: !!dryRun });

          const inputs: Input[] = [];
          inputs.push({ name: "schematic", value: schematic });
          inputs.push({
            name: "collection",
            value: collection
          });

          await this.action.handle(inputs, options);
        }
      );
  }
}
