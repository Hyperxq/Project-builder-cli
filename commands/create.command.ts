import { AbstractCommand } from './abstract.command';
import { Command } from 'commander';
import { Input } from './command.input';

export class CreateCommand extends AbstractCommand {
  public async load(program: Command): Promise<void> {
    program
      .command('create [workspace-name] [schema-id] ')
      .alias('c')
      // TODO: we need to get the right description depends on the framework flag
      .description(
        'Create a workspace and execute many schematic depends on the schema-id',
      )
      .option(
        '--dry-run',
        'Report actions that would be taken without writing out results.',
      )
      .option('--interactive', 'Enable interactive input prompts.')
      .option(
        '--f, --framework',
        'Determinate which framework use to create the workspace. [choices: "Angular", "Nestjs", "VanillaTs"]',
        'Angular',
      )

      .option(
        '--defaults',
        'Disable interactive input prompts for options with a default.',
      )

      .option('--force', 'Force overwriting of existing files.')
      .option('-c, --collection', 'Schematics collection to use.')

      .option('--commit', 'Initial git repository commit information.')

      .option(
        '--createApplication',
        "Create a new initial application project in the 'src' folder of the new workspace. When false, creates an empty workspace with no initial application. You can then use the generate application command so that all applications are created in the projects folder.",
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
      )
      .option(
        '--newProjectRoot [newProjectRoot]',
        'The path where new projects will be created, relative to the new workspace root.',
      )
      .option(
        '--packageManager [packageManager]',
        'The package manager used to install dependencies.  [choices: "npm", "yarn", "pnpm", "cnpm"]',
      )
      .option(
        '-p, --prefix',
        'The prefix to apply to generated selectors for the initial project.',
      )

      .option('--routing', 'Enable routing in the initial project.')
      .option('-g, --skip-git', 'Do not initialize a git repository.')
      .option('--skip-install', 'Skip package installation.')
      .option(
        '-S, --skip-tests',
        'Do not generate "spec.ts" test files for the new project.',
      )

      .option(
        '--standalone [standalone]',
        'Creates an application based upon the standalone API, without NgModules.',
      )

      .option(
        '--strict [strict]',
        'Creates a workspace with stricter type checking and stricter bundle budgets settings. This setting helps improve maintainability and catch bugs ahead of time.',
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

      .action(
        async (
          schemaId: string,
          workspaceName: string,
          command: { [key: string]: any },
        ) => {
          const {
            dryRun,
            interactive,
            framework,
            defaults,
            force,
            collection,
            commit,
            createApplication,
            directory,
            inlineStyle,
            inlineTemplate,
            minimal,
            newProjectRoot,
            packageManager,
            prefix,
            routing,
            skipGit,
            skipInstall,
            skipTests,
            standalone,
            strict,
            style,
            ssr,
            viewEncapsulation,
          } = command;
          const options: Input[] = [];
          //TODO: refactor this
          if (dryRun !== undefined)
            options.push({ name: 'dry-run', value: dryRun });
          if (interactive !== undefined)
            options.push({ name: 'interactive', value: interactive });
          if (framework !== undefined)
            options.push({ name: 'framework', value: framework });
          if (defaults !== undefined)
            options.push({ name: 'defaults', value: defaults });
          if (force !== undefined)
            options.push({ name: 'force', value: force });
          if (collection !== undefined)
            options.push({ name: 'collection', value: collection });
          if (commit !== undefined)
            options.push({ name: 'commit', value: commit });
          if (createApplication !== undefined)
            options.push({
              name: 'createApplication',
              value: createApplication,
            });
          if (directory !== undefined)
            options.push({ name: 'directory', value: directory });
          if (inlineStyle !== undefined)
            options.push({ name: 'inlineStyle', value: inlineStyle });
          if (inlineTemplate !== undefined)
            options.push({ name: 'inlineTemplate', value: inlineTemplate });
          if (minimal !== undefined)
            options.push({ name: 'minimal', value: minimal });
          if (newProjectRoot !== undefined)
            options.push({ name: 'newProjectRoot', value: newProjectRoot });
          if (packageManager !== undefined)
            options.push({ name: 'packageManager', value: packageManager });
          if (prefix !== undefined)
            options.push({ name: 'prefix', value: prefix });
          if (routing !== undefined)
            options.push({ name: 'routing', value: routing });
          if (skipGit !== undefined)
            options.push({ name: 'skip-git', value: skipGit });
          if (skipInstall !== undefined)
            options.push({ name: 'skip-install', value: skipInstall });
          if (skipTests !== undefined)
            options.push({ name: 'skip-tests', value: skipTests });
          if (standalone !== undefined)
            options.push({ name: 'standalone', value: standalone });
          if (strict !== undefined)
            options.push({ name: 'strict', value: strict });
          if (style !== undefined)
            options.push({ name: 'style', value: style });
          if (ssr !== undefined) options.push({ name: 'ssr', value: ssr });
          if (viewEncapsulation !== undefined)
            options.push({
              name: 'viewEncapsulation',
              value: viewEncapsulation,
            });

          await this.action.handle(
            [
              { name: 'schemaId', value: schemaId },
              {
                name: 'workspaceName',
                value: workspaceName,
              },
            ],
            options,
          );
        },
      );
  }
}
