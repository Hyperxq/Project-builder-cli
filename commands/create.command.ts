import { AbstractCommand } from './abstract.command';
import { Command } from 'commander';
import { Input } from './command.input';

export class CreateCommand extends AbstractCommand {
  public async load(program: Command): Promise<void> {
    program
      .command('create [schema-id]')
      .alias('c')
      // TODO: we need to get the right description depends on the framework flag
      .description(
        'Create a workspace and execute many schematic depends on the schema-id',
      )
      .option(
        '--dry-run',
        'Report actions that would be taken without writing out results.',
        false,
      )
      .option('--interactive', 'Enable interactive input prompts.', true)
      .option(
        '--f, --framework',
        'Determinate which framework use to create the workspace. [choices: "Angular", "Nestjs", "VanillaTs"]',
        'Angular',
      )

      .option(
        '--defaults',
        'Disable interactive input prompts for options with a default.',
        false,
      )

      .option('--force', 'Force overwriting of existing files.', false)
      .option('-c, --collection', 'Schematics collection to use.')

      .option('--commit', 'Initial git repository commit information.', true)

      .option(
        '--createApplication',
        "Create a new initial application project in the 'src' folder of the new workspace. When false, creates an empty workspace with no initial application. You can then use the generate application command so that all applications are created in the projects folder.",
        true,
      )

      .option('--directory', 'The directory name to create the workspace in.')
      .option(
        '--inlineStyle',
        'Include styles inline in the component TS file. By default, an external styles file is created and referenced in the component TypeScript file.',
      )

      .option(
        '-t, --inline-template',
        'Include template inline in the component TS file. By default, an external template file is created and referenced in the component TypeScript file.',
      )

      .option(
        '--minimal',
        ' Create a workspace without any testing frameworks. (Use for learning purposes only.)',
        false,
      )
      .option(
        '--newProjectRoot [newProjectRoot]',
        'The path where new projects will be created, relative to the new workspace root.',
        'projects',
      )
      .option(
        '--packageManager [packageManager]',
        'The package manager used to install dependencies.  [choices: "npm", "yarn", "pnpm", "cnpm"]',
      )
      .option(
        '-p, --prefix',
        'The prefix to apply to generated selectors for the initial project.',
        'app',
      )

      .option('--routing', 'Enable routing in the initial project.')
      .option('-g, --skip-git', 'Do not initialize a git repository.', false)
      .option('--skip-install', 'Skip package installation.', false)
      .option(
        '-S, --skip-tests',
        'Do not generate "spec.ts" test files for the new project.',
        false,
      )

      .option(
        '--standalone [standalone]',
        'Creates an application based upon the standalone API, without NgModules.',
        true,
      )

      .option(
        '--strict [strict]',
        'Creates a workspace with stricter type checking and stricter bundle budgets settings. This setting helps improve maintainability and catch bugs ahead of time.',
        true,
      )

      .option(
        '--style [style]',
        'The file extension or preprocessor to use for style files.  [choices: "css", "scss", "sass", "less"]',
      )
      .option(
        '--ssr [ssr]',
        'Creates an application with Server-Side Rendering (SSR) and Static Site Generation (SSG/Prerendering) enabled',
      )
      .option(
        '--viewEncapsulation [viewEncapsulation]',
        'The view encapsulation strategy to use in the initial project. [choices: "Emulated", "None", "ShadowDom"]',
      )

      .action(async (schemaId: string, command: { [key: string]: any }) => {
        console.log({
          schemaId,
          command,
        });
        const {
          newProjectRoot,
          inlineStyle,
          inlineTemplate,
          viewEncapsulation,
          routing,
          prefix = 'app',
          skipTests,
          createApplication = true,
          style,
          ssr,
          standalone = true,
          strict,
          packageManager,
          directory,
          dryRun,
          collection,
          skipInstall = false,
        } = command;
        const options: Input[] = [];
        options.push({ name: 'newProjectRoot', value: !!newProjectRoot });
        options.push({ name: 'inlineStyle', value: !!inlineStyle });
        options.push({ name: 'inlineTemplate', value: !!inlineTemplate });
        options.push({
          name: 'viewEncapsulation',
          value: !!viewEncapsulation,
        });
        options.push({ name: 'routing', value: !!routing });
        options.push({ name: 'prefix', value: !!prefix });
        options.push({ name: 'skipTests', value: !!skipTests });
        options.push({
          name: 'createApplication',
          value: createApplication,
        });
        options.push({ name: 'style', value: !!style });
        options.push({ name: 'skipTests', value: !!skipTests });
        options.push({ name: 'ssr', value: !!ssr });
        options.push({ name: 'standalone', value: standalone });
        options.push({ name: 'packageManager', value: !!packageManager });
        options.push({ name: 'strict', value: !!strict });
        options.push({ name: 'directory', value: !!directory });
        options.push({ name: 'collection', value: !!collection });
        options.push({ name: 'skip-install', value: skipInstall });
        options.push({ name: 'dry-run', value: !!dryRun });

        await this.action.handle(
          [{ name: 'schema-id', value: schemaId }],
          options,
        );
      });
    // program.parse(process.argv);
  }
}
