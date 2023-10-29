import {Reader} from '../readers';
import {Configuration} from './configuration';
import {ConfigurationLoader} from './configuration.loader';

/**
 * A cache table that maps some reader (by its name along with the config path)
 * to a loaded configuration.
 * This was added because several commands rely on the app's config
 * to generate some dynamic content prior to running the command itself.
 */
const loadedConfigsCache = new Map<string, Required<Configuration>>();

export class AngularConfigurationLoader implements ConfigurationLoader {
  constructor(private readonly reader: Reader) {}

  public async load(name?: string) {
    // const cacheEntryKey = `${this.reader.constructor.name}:${name}`;
    // const cachedConfig = loadedConfigsCache.get(cacheEntryKey);
    // if (cachedConfig) {
    //   return cachedConfig;
    // }
    //
    // let loadedConfig: Required<Configuration> | undefined;
    //
    // const content: string | undefined = name
    //   ? await this.reader.read(name)
    //   : await this.reader.readAnyOf(['angular.json', '.angular.json']);
    //
    // if (content) {
    //   const fileConfig = JSON.parse(content);
    //   if (fileConfig.compilerOptions) {
    //     loadedConfig = {
    //       ...defaultConfiguration,
    //       ...fileConfig,
    //       compilerOptions: {
    //         ...defaultConfiguration.compilerOptions,
    //         ...fileConfig.compilerOptions,
    //       },
    //     };
    //   } else {
    //     loadedConfig = {
    //       ...defaultConfiguration,
    //       ...fileConfig,
    //     };
    //   }
    // } else {
    //   loadedConfig = defaultConfiguration;
    // }
    //
    // loadedConfigsCache.set(cacheEntryKey, loadedConfig!);
    // return loadedConfig!;
    return {};
  }
}
