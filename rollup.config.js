import swc from 'rollup-plugin-swc3';
import copy from 'rollup-plugin-copy';
import addShebang from 'rollup-plugin-add-shebang';
import path, {resolve} from "path";
import {readFileSync} from "fs";
import {fileURLToPath} from 'url';

const includePackageJson = () => {
    return {
        name: 'include-package-json', generateBundle() {
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);

            let packageJson = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));
            delete packageJson.scripts;

            this.emitFile({
                type: 'asset', fileName: 'package.json', source: JSON.stringify(packageJson, null, 2),
            });
        },
    };
};

export default [
    {
        input: {
           abstract: 'actions/abstract.action.ts',
           create: 'actions/create.action.ts',
           generate: 'actions/generate.action.ts',
            index: 'commands/index.ts',
        },
        output: {
            dir: 'dist/actions',
            format: 'es'
        },
        plugins: [
            swc({
                configFile: '.swcrc'
            }),
        ],
        external: ['commander', 'ansi-colors', 'tty'],
    },
    {
        input: {
            abstract: 'commands/abstract.command.ts',
            create: 'commands/create.command.ts',
            generate: 'commands/generate.command.ts',
            loader: 'commands/command.loader.ts',
            input: 'commands/command.input.ts',
            index: 'commands/index.ts',
        },
        output: {
            dir: 'dist/commands',
            format: 'es'
        },
        plugins: [
            swc({
                configFile: '.swcrc'
            }),
        ],
        external: ['commander', 'ansi-colors', 'tty'],
    },
    {
        input: 'bin/builder.ts',
        output: {
            dir: 'dist/bin', format: 'es'
        },
        plugins: [
            swc({
                configFile: '.swcrc'
            }),
            addShebang({
                include: 'dist/bin/builder.js'
            })
        ],
        external: ['commander', 'fs', 'url', 'path', 'ansi-colors', 'tty'],
    },
    {
        input: 'src/index.ts', // Replace with the entry point of your CLI
        output: [{
            dir: 'dist/lib', format: 'es'
        }],
        plugins: [
            swc({
                configFile: '.swcrc'
            }),
            copy({
                targets: [
                    {
                        src: 'package.json',
                        dest: 'dist',
                        transform: (contents) => {
                            const packageData = JSON.parse(contents.toString());
                            delete packageData.scripts;
                            delete packageData.devDependencies;
                            delete packageData.keywords;
                            delete packageData.engines;
                            return JSON.stringify(packageData, null, 2);
                        }
                    }
                ],
                hook: 'writeBundle',
            })
        ],
    }
];