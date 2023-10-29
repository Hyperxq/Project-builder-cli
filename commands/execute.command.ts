import {AbstractCommand} from "./abstract.command";
import {Command} from "commander";

export class ExecuteCommand extends AbstractCommand {
    public async load(program: Command): Promise<void> {
        program
            .command('execute <schematic>')
            .alias('exc')
            // TODO: we need to get the right description depends on the command
            // .description(await this.buildDescription())
            .option(
                '-d, --dry-run',
                'Report actions that would be taken without writing out results.',
            )
            .option(
                '-c, --collection [collectionName]',
                'Schematics collection to use.',
            )
            .action(async () => {
                console.log('execute works!!!');
            });
    }


}
