import { Input } from '../commands';
import { AbstractAction } from './abstract.action';
import { AngularCli, CLIFactory } from '../lib/CLI';
import { CLI } from '../lib/CLI/cli.enum';
import { colors } from '../lib/utils';

export class CreateAction extends AbstractAction {
  public async handle(inputs: Input[], flags: Input[]) {
    await create(inputs, flags);
  }
}

const create = async (inputs: Input[], flags: Input[]) => {
  const flagsExclude = ['framework', 'schemaId'];
  const inputsExclude = ['schemaId'];
  const cli = CLIFactory(CLI.ANGULAR) as AngularCli;
  try {
    //1. Create workspace, call angular cli.
    const schemaId: Input | undefined = inputs.find(
      (input) => input.name === 'schemaId',
    );

    const inputsString = inputs
      .filter((input) => inputsExclude.some((i) => i === input.name))
      .map((input) => input.value as string);

    const flagsFiltered = flags.filter(
      (flag) => !flagsExclude.some((f) => f === flag.name),
    );

    await cli.runCommand(cli.getNgNewCommand(inputsString, flagsFiltered));
  } catch (e) {
    throw new Error(
      colors.bold(
        colors.red(`something happen when we try to create a new workspace`),
      ),
    );
  }
  //2. Read JSON remote file.
  //3. Execute build schematic, call angular-builder schematic.
};
