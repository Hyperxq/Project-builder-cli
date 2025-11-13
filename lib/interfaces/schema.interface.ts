export interface SchematicsCollectionSchema {
  extends?: string | string[]
  schematics: {
    [key: string]: {
      aliases?: string[]
      factory: string
      description: string
      extends?: string
      schema?: string
      hidden?: boolean
      private?: boolean
    }
  }
  version?: string
}
