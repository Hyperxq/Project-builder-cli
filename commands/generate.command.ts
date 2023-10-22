import {AbstractCommand} from "./abstract.command";
import {program} from "commander";

export class GenerateCommand extends AbstractCommand {
    public async load(): Promise<void> {
        program
        .command('generate <schematic> [name] [path]')
        .alias('g')
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
            console.log('generate works!!!');
        });
    }


}
