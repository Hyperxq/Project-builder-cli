import { VerificationState } from "../enums/verification-state.enum";

export interface Template {
  id: string;
  name: string;
  createBy: string;
  usedCount: number;
  username: string;
  json: string;
  userTemplateVerificationState: VerificationState;
  cliOptions: CliOptions;
}

export enum CLI {
  Angular = "Angular",
  Nestjs = "Nestjs",
}

export interface CliOptions {
  cli: CLI,
  options: { [p: string]: any };
}