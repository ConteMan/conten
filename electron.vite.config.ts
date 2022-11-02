import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite'
import presetAttributify from '@unocss/preset-attributify'
import presetIcons from '@unocss/preset-icons'
import IconsResolver from 'unplugin-icons/resolver'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  main: {
    resolve: {
      alias: {
        '@main': resolve('src/main'),
      },
    },
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        external: [
          '@electron-toolkit/utils',
        ],
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        external: ['@electron-toolkit/preload'],
      },
    },
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
      },
    },
    plugins: [
      vue({
        reactivityTransform: true,
      }),
      Unocss({
        presets: [
          presetAttributify(),
          presetIcons(),
        ],
      }),
      AutoImport({
        imports: [
          'vue',
          '@vueuse/core',
        ],
        dirs: [resolve('src/renderer/src')],
        dts: resolve('src/renderer/src/auto-imports.d.ts'),
      }),
      Components({
        dirs: [resolve('src/renderer/src/components')],
        dts: resolve('src/renderer/src/components.d.ts'),
        resolvers: [
          IconsResolver({
            componentPrefix: '',
          }),
        ],
      }),
    ],
  },
})
