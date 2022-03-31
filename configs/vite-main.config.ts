import { join, resolve } from 'path'
import { builtinModules } from 'module'
import { defineConfig } from 'vite'
import esmodule from 'vite-plugin-esmodule'
import pkg from '../package.json'

export const r = (...args: string[]) => resolve(__dirname, '..', ...args)

export default defineConfig({
  mode: process.env.NODE_ENV,
  root: join(__dirname, '../src/main'),
  resolve: {
    alias: [
      {
        find: '~/',
        replacement: `${r('src')}/`,
      },
    ]
  },
  plugins: [
    esmodule([
      'koa',
    ]),
  ],
  build: {
    outDir: '../../dist/main',
    lib: {
      entry: 'index.ts',
      formats: ['cjs'],
    },
    minify: process.env.NODE_ENV === 'production',
    emptyOutDir: true,
    rollupOptions: {
      external: [
        'electron',
        'koa',
        ...builtinModules,
        ...Object.keys((pkg as Record<string, any>).dependencies || {}),
        '@prisma/client',
        '.prisma/client'
      ],
      output: {
        entryFileNames: '[name].cjs',
      },
    },
  },
})
