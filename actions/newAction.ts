import { AbstractAction } from "./abstract.action";
import { Input } from "../commands";

export class NewAction extends AbstractAction {
  public async handle(inputs: Input[], options: Input[]) {
    await generateFiles(inputs.concat(options));
  }
}

const generateFiles = async (inputs: Input[]) => {
};