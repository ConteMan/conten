<script setup lang="ts">
import type { GlobalThemeOverrides } from 'naive-ui'
import { NConfigProvider, darkTheme, dateZhCN, zhCN } from 'naive-ui'

import { useSystemState } from './store/system'

import AppContent from './layout/AppContent.vue'

const data = reactive({
  theme: null as null | typeof darkTheme,
})
const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#ff4f49',
    primaryColorHover: '#fd2720',
  },
  Input: {
    borderHover: '#fff',
    borderFocus: '#fff',
    boxShadowFocus: '#fff',
    caretColor: '#e5e5e5',
  },
  Switch: {
    boxShadowFocus: '#fff',
  },
}

const systemState = useSystemState()
const { themeWithSystem, isDark } = storeToRefs(systemState)

const darkDeal = (isDark: boolean) => {
  if (isDark)
    data.theme = darkTheme
  else
    data.theme = null
}
darkDeal(isDark.value)

const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
watch(prefersDark, (newVal) => {
  if (themeWithSystem.value) {
    if (newVal)
      systemState.toggleDark(true)
    else
      systemState.toggleDark(false)
  }
})

watch(isDark, (dark) => {
  darkDeal(dark)
})
</script>

<template>
  <n-config-provider
    class="config-container"
    :theme="data.theme"
    :theme-overrides="themeOverrides"
    :locale="zhCN"
    :date-locale="dateZhCN"
  >
    <n-notification-provider>
      <n-message-provider placement="top-right">
        <AppContent />
      </n-message-provider>
    </n-notification-provider>
    <n-global-style />
  </n-config-provider>
</template>
