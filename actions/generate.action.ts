import {Input} from "../commands";
import {AbstractAction} from "./abstract.action";

export class GenerateAction extends AbstractAction {
    public async handle(inputs: Input[], options: Input[]) {
        await generateFiles(inputs.concat(options));
    }
}

const generateFiles = async (inputs: Input[]) => {
};