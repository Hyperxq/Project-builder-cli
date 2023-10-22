import { AbstractAction } from '../actions';
import {Command} from "commander";

export abstract class AbstractCommand {
    constructor(protected action: AbstractAction) {}

    public abstract load(program: Command): void;
}