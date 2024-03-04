# Project Builder CLI

The Project Builder CLI is a versatile command-line interface tool designed to streamline and enhance the development workflow for Angular developers. By providing the capability to execute Angular schematics outside of an Angular workspace, create new Angular schematics project libraries, and automate complex project setups, this CLI tool offers a comprehensive solution for modern development challenges.

![image](https://github.com/Hyperxq/Project-builder-cli/assets/22332354/d3873283-cf42-4d3d-9330-63508f4d116e)

## Key Features

1. **Execute Angular Schematics Anywhere**: Run `builder exec [collection-name] [schematics-name]` from any directory, eliminating the need for a specific Angular workspace context. This feature enhances flexibility and efficiency in utilizing Angular schematics across diverse projects.

2. **Scaffolding for Schematics Libraries**: Easily create ready-to-publish Angular schematics project libraries with the command `builder new [project-name] [author]`. The CLI sets up all necessary configurations, allowing you to focus on developing your schematics.

3. **Automated Complex Project Setup**: Leverage the CLI's ability to orchestrate complex project setups with a single command. It integrates seamlessly with existing CLI tools like Angular CLI, NestJS CLI, or NX CLI to create the workspace, followed by executing defined schematics through Project Builder, streamlining the project initialization process.

## Requirements

- Node.js version 20 or higher.

## Installation

Install the Project Builder CLI globally using npm to make it accessible from anywhere in your system:

```sh
npm i -g @pbuilder/cli
```

## Usage

To get started, you can invoke the help command to explore the CLI's capabilities:

```sh
builder --help
```

## Contributing

We welcome contributions from the community! If you're interested in enhancing the Project Builder CLI, please review our [CONTRIBUTING.md](./CONTRIBUTING.md) guide for details on the contribution process, coding standards, and how to submit pull requests.

## How does it work?

Check the miro link to check:
[Flow diagram](https://miro.com/welcomeonboard/ZkZicUdSYlp2TlhuRG1FRDhkY1FJZnF2VGJ2dTlPSkFsY1Z1WU1NWWVYUk05MmVUUTFPQWZVTjNMWTJ0bTBObHwzNDU4NzY0NTY2NTc1MDcwODI0fDI=?share_link_id=741166420035)
