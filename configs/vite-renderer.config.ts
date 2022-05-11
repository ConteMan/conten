import { join, resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

import WindiCSS from 'vite-plugin-windicss'
import pkg from '../package.json'
import windiConfig from './windi.config'

export const r = (...args: string[]) => resolve(__dirname, '..', ...args)

export default defineConfig({
  mode: process.env.NODE_ENV,
  root: join(__dirname, '../src/renderer'),
  resolve: {
    alias: [
      {
        find: '@renderer/',
        replacement: `${r('src/renderer/src')}/`,
      },
      {
        find: '@main/',
        replacement: `${r('src/main')}/`,
      },
    ],
  },
  plugins: [
    vue(),

    Components({
      dirs: [
        r('src/renderer/src/components'),
      ],
      // generate `components.d.ts` for ts support with Volar
      dts: true,
      resolvers: [NaiveUiResolver()],
    }),

    AutoImport({
      imports: [
        'vue',
        'vue-router',
        '@vueuse/core',
        '@vueuse/head',
      ],
      dts: r('src/renderer/src/auto-imports.d.ts'),
    }),

    // https://github.com/antfu/vite-plugin-windicss
    WindiCSS({
      config: windiConfig,
    }),
  ],
  base: './',
  build: {
    emptyOutDir: true,
    outDir: '../../dist/renderer',
  },
  server: {
    host: pkg.env.HOST,
    port: pkg.env.PORT,
  },
})
