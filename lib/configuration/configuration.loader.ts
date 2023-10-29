import { Configuration } from './configuration';

export interface ConfigurationLoader {
  load(name?: string): Configuration | Promise<Required<Configuration>>;
}