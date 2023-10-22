import * as chalk from 'chalk';
import {Command, program} from 'commander';
import {GenerateCommand} from "./generate.command";
import {GenerateAction} from "../actions";
import {ERROR_PREFIX} from "../lib/ui";
import {colors} from "../lib/utils";

export class CommandLoader {
    public static async load(): Promise<void> {
        // new NewCommand(new NewAction()).load(program);
        // new BuildCommand(new BuildAction()).load(program);
        // new StartCommand(new StartAction()).load(program);
        // new InfoCommand(new InfoAction()).load(program);
        // new AddCommand(new AddAction()).load(program);
        await new GenerateCommand(new GenerateAction()).load();

        this.handleInvalidCommand();
    }

    private static handleInvalidCommand() {
        program.on('command:*', () => {
            console.error(
                `\n${ERROR_PREFIX} Invalid command: ${colors.red('%s')}`,
                program.args.join(' '),
            );
            console.log(
                `See ${colors.red('--help')} for a list of available commands.\n`,
            );
            process.exit(1);
        });
    }
}