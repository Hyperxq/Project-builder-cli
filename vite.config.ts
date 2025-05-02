// vite.config.ts
import { defineConfig } from 'vite'
import path from 'node:path'
import { globSync } from 'glob'
import type { Plugin as RollupPlugin } from 'rollup'

export default (async () => {
  // Dynamically import the ESM-only plugins
  const [
    { default: tsconfigPaths },
    { viteStaticCopy },
    swcPkg,
    addShebangPkg,
  ] = await Promise.all([
    import('vite-tsconfig-paths'),
    import('vite-plugin-static-copy'),
    import('unplugin-swc'),
    import('rollup-plugin-add-shebang'),
  ])
  const swc = swcPkg.default
  const addShebang = addShebangPkg.default

  // Helpers
  const normalize = (u: string) => u.replace(/\\/g, '/')
  const stripSrc = (s: string) => normalize(s).replace(/^src\//, '')

  // 1. Gather your entry points
  // ────────────────────────────
  // Main API:
  const inputs: Record<string, string> = {
    public_api: path.resolve(__dirname, 'src/public_api.ts'),
  }
  // bin/*.ts
  const binFiles = globSync('bin/*.ts', { nodir: true })
  for (const file of binFiles) {
    const name = path.basename(file, path.extname(file))
    // this will output dist/bin/<name>.js
    inputs[`bin/${name}`] = path.resolve(__dirname, file)
  }

  // 2. Build up your copy targets (only if files actually exist)
  // ─────────────────────────────────────────────────────────────
  const copyTargets: Parameters<typeof viteStaticCopy>[0]['targets'] = []
  if (globSync('package.json').length) {
    copyTargets.push({
      src: 'package.json',
      dest: '',
      transform: (contents) => {
        const pkg = JSON.parse(contents.toString())
        delete pkg.scripts
        delete pkg.devDependencies
        delete pkg.keywords
        delete pkg.engines
        return JSON.stringify(pkg, null, 2)
      },
    })
  }
  if (globSync('README.md').length) {
    copyTargets.push({ src: 'README.md', dest: '' })
  }
  if (globSync('src/collection.json').length) {
    copyTargets.push({
      src: 'src/collection.json',
      dest: '',
      rename: (_n, _e, full) => stripSrc(full),
    })
  }
  if (globSync('src/**/*.json', { nodir: true }).length) {
    copyTargets.push({
      src: 'src/**/*.json',
      dest: '',
      rename: (_n, _e, full) => stripSrc(full),
    })
  }
  if (globSync('src/**/*.d.ts', { nodir: true }).length) {
    copyTargets.push({
      src: 'src/**/*.d.ts',
      dest: '',
      rename: (_n, _e, full) => stripSrc(full),
    })
  }
  if (globSync('src/**/*.template', { nodir: true }).length) {
    copyTargets.push({
      src: 'src/**/*.template',
      dest: '',
      rename: (_n, _e, full) => stripSrc(full),
    })
  }
  if (globSync('src/**/.*.template', { nodir: true }).length) {
    copyTargets.push({
      src: 'src/**/.*.template',
      dest: '',
      rename: (_n, _e, full) => stripSrc(full),
    })
  }

  // 3. Final Vite config
  // ────────────────────
  return defineConfig({
    plugins: [
      // TS path aliasing
      tsconfigPaths(),

      // SWC for TS → JS
      swc.vite({
        jsc: {
          parser: { syntax: 'typescript', tsx: false },
          target: 'es2021',
        },
      }),

      // Copy your JSON / .d.ts / templates / README / package.json
      viteStaticCopy({
        silent: true,
        targets: copyTargets,
      }),
    ],

    build: {
      target: 'node16', // CLI runs on Node
      outDir: 'dist',
      emptyOutDir: true, // clean dist/

      rollupOptions: {
        // 1. Entry points
        input: inputs,

        // 2. Treat these modules as external
        external: [
          'commander',
          'ansi-colors',
          'tty',
          'node-emoji',
          'fs',
          'ora',
          'path',
          'child_process',
          'node:module',
          '@angular/cli',
          '@nestjs/cli',
          '@angular-devkit/schematics-cli',
          '@angular-devkit/core',
          '@angular-devkit/schematics',
          'npm-registry-fetch',
          'form-data',
          'axios',
          'npm-package-arg',
          'winston',
          'winston-console-format',
          /^node:/,
        ],

        // 4. Output settings
        output: {
          dir: 'dist',
          format: 'cjs',
          entryFileNames: '[name].js',
          exports: 'auto',
        },
      },
    },
  })
})()
