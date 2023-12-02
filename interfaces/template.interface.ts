import { VerificationState } from '../enums/verification-state.enum';

export interface Template {
  id: string;
  name: string;
  createBy: string;
  votesCount: number;
  issuesCount: number;
  verificationState: VerificationState;
  json: string;
  description: string;
  framework?: Framework;
}

class FrameworkState {}

export interface Framework {
  id: string;
  name: string;
  icon: string;
  state: FrameworkState;
}
