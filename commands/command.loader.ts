import { Command } from "commander";
import { CreateAction, GenerateAction } from "../actions";
import { ERROR_PREFIX } from "../lib/ui";
import { colors } from "../lib/utils";
import { CreateCommand } from "./create.command";
import { GenerateCommand } from "./generate.command";

export class CommandLoader {
  public static async load(program: Command): Promise<void> {
    // await new NewCommand(new ExecuteAction()).load(program);
    await new GenerateCommand(new GenerateAction()).load(program);
    await new CreateCommand(new CreateAction()).load(program);

    this.handleInvalidCommand(program);
  }

  private static handleInvalidCommand(program: Command) {
    program.on("command:*", () => {
      console.error(
        `\n${ERROR_PREFIX} Invalid command: ${colors.red("%s")}`,
        program.args.join(" ")
      );
      console.log(
        `See ${colors.red("--help")} for a list of available commands.\n`
      );
      process.exit(1);
    });
  }
}
