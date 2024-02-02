import { AbstractCommand } from "./abstract.command";
import { Command } from "commander";

export class NewCommand extends AbstractCommand {
  public async load(program: Command): Promise<void> {
    program
      .command("execute <schematic>")
      .alias("exc")
      .option(
        "-d, --dry-run",
        "Report actions that would be taken without writing out results."
      )
      .action(async () => {
        console.log("execute works!!!");
      });
  }


}
