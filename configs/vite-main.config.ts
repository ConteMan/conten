import { resolve } from 'path'
import { builtinModules } from 'module'
import { defineConfig } from 'vite'
import pkg from '../package.json'

export const r = (...args: string[]) => resolve(__dirname, '..', ...args)

export default defineConfig({
  mode: process.env.NODE_ENV,
  root: r('src/main'),
  resolve: {
    alias: {
      '@main/': `${r('src/main')}/`,
    },
  },
  plugins: [
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
        ...builtinModules,
        ...Object.keys((pkg as Record<string, any>).dependencies || {}),
      ],
      output: {
        entryFileNames: '[name].cjs',
      },
    },
  },
})
