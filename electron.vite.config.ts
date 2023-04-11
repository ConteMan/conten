import { resolve } from 'node:path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  main: {
    resolve: {
      alias: {
        '@main': resolve('src/main'),
        '@preload': resolve('src/preload'),
        '@constants': resolve('src/main/constants'),
      },
    },
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    resolve: {
      alias: {
        '@main': resolve('src/main'),
        '@preload': resolve('src/preload'),
        '@constants': resolve('src/main/constants'),
      },
    },
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@constants': resolve('src/main/constants'),
      },
    },
    plugins: [
      vue({
        reactivityTransform: true,
      }),
      Unocss(),
      AutoImport({
        imports: [
          'vue',
          'vue-router',
          '@vueuse/core',
          {
            pinia: ['storeToRefs'],
          },
        ],
        dirs: [resolve('src/renderer/src')],
        dts: resolve('src/renderer/src/auto-imports.d.ts'),
      }),
      Components({
        dirs: [
          resolve('src/renderer/src/components'),
          resolve('src/renderer/src/layout'),
        ],
        dts: resolve('src/renderer/src/components.d.ts'),
        resolvers: [
          IconsResolver({
            componentPrefix: '',
          }),
        ],
      }),
      Icons({
        autoInstall: true,
        compiler: 'vue3',
      }),
    ],
  },
})
