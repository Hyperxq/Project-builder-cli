import { AbstractCommand } from "./abstract.command";
import { Command } from "commander";
import { Input } from "./command.input";

export class CreateCommand extends AbstractCommand {
  public async load(program: Command): Promise<void> {
    //[workspace-name]
    program
      .command("create [template-id]")
      .alias("c")
      // TODO: we need to get the right description depends on the framework flag
      .option(
        "--dry-run",
        "Report actions that would be taken without writing out results.",
        false
      )
      .option("--skip-install", "Skip package installation.", false)
      .description(
        "Create a workspace and execute many schematic depends on the schema-id"
      )
      .addHelpCommand("create angular --help", "show assistance")
      .action(
        async (
          templateId: string,
          command: { [key: string]: any }
        ) => {
          const dryRun: boolean = command?.dryRun;
          const skipInstall: boolean = command?.skipInstall;

          const options: Input[] = [];
          const inputs: Input[] = [
            {
              name: "template-id",
              value: templateId
            }
            // {
            //   name: 'workspace-name',
            //   value: workspaceName,
            // },
          ];

          options.push({ name: "dry-run", value: dryRun });
          options.push({ name: "skip-install", value: skipInstall });

          await this.action.handle(inputs, options);
        }
      );
  }
}
