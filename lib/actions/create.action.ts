import { SchematicsException, strings } from '@angular-devkit/schematics'
import axios from 'axios'
import { Input } from '../commands'
import { CliOptions, Template } from '../interfaces/template.interface'
import { CLIFactory, SchematicsCli } from '../CLI'
import { CLI } from '../CLI/cli.enum'
import { Collection } from '../schematics'
import { MESSAGES } from '../ui'
import chalk from 'chalk'
import { Spinner, createWorkspace, findInput } from '../utils'
import { AbstractAction } from './abstract.action'

export class CreateAction extends AbstractAction {
  public async handle(inputs: Input[], flags: Input[]) {
    await create(inputs, flags)
  }
}

const create = async (inputs: Input[] = [], flags: Input[] = []) => {
  const flagsExcluded = ['template-id', 'name']
  const inputsExcluded = ['template-id']

  const schemaId = findInput(inputs, 'template-id')

  // const dryRun = findInput(inputs, 'dry-run');
  // Read remote Template.
  const {
    json: workspaceStructure,
    cliOptions,
    createBy,
    name,
  } = await fetchData(schemaId.value as string)

  console.log(MESSAGES.WELCOME(name, createBy))

  const { cli: frameworkName, options } = cliOptions as CliOptions

  const workspaceInputs = Object.entries(options).map((value) => ({
    name: value[0],
    value: value[1],
  }))

  await createWorkspace(
    frameworkName,
    inputs,
    [...flags, ...workspaceInputs],
    inputsExcluded,
    flagsExcluded,
  )

  const buildFlags: Input[] = [
    { name: 'install-collection', value: true },
    { name: 'add-collections', value: true },
    {
      name: 'name',
      value: options.name,
    },
    { name: 'base64-string', value: workspaceStructure },
  ]

  const schematicsCLI = CLIFactory(CLI.SCHEMATICS) as SchematicsCli
  try {
    // 3. Execute build schematic, call angular-builder schematic.
    await schematicsCLI.runCommand(
      schematicsCLI.getExecuteCommand(
        Collection.ANGULARBUILDER,
        'init',
        [],
        buildFlags,
      ),
      false,
      `./${strings.dasherize(options.name as string)}`,
    )
  } catch (e) {
    throw new Error(
      `${chalk.bold(
        chalk.red(`something happen when we try to build the schema json:`),
      )} ${e.message}`,
    )
  }
}

async function fetchData(templateId: string): Promise<Template> {
  const spinner = new Spinner()
  try {
    spinner.start(
      chalk.blue(`Validating template-id: ${chalk.bold(templateId)}`),
    )
    const { data } = await axios.get<Template>(
      `https://project-builder-backend-production.up.railway.app/user-templates?id=${templateId}`,
    )
    if (!data) {
      spinner.stop()
      throw new Error(
        `The template-id ${chalk.bold(chalk.red(templateId))} is ${chalk.red(
          'not valid',
        )} or something happened wrong`,
      )
    }
    const { cliOptions } = data
    const { options } = cliOptions as CliOptions
    const workspaceName = options.name

    data.json = replaceDefaultProject(data.json, workspaceName)
    spinner.succeed(
      `The template-id ${chalk.bold(chalk.green(templateId))} is ${chalk.green('valid')}`,
    )

    return data
  } catch (error) {
    spinner.stop()
    throw new SchematicsException(error)
  }
}

function replaceDefaultProject(data: string, workspaceName: string) {
  const regex = /(\[DEFAULT-PROJECT])/gm
  const jsonString = JSON.stringify(data)

  return Buffer.from(jsonString.replace(regex, workspaceName)).toString(
    'base64',
  )
}
