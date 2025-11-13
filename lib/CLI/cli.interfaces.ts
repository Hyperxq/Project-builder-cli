import { Input } from '../commands'

export interface CommandOptions {
  command?: string
  inputs: string[]
  flags: Input[]
}

export interface SchematicCommandOptions extends CommandOptions {
  collection: string
  schematic: string
}
