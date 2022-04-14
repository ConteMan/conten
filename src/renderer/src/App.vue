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

<script setup lang="ts">
import type { GlobalThemeOverrides } from 'naive-ui'
import { darkTheme } from 'naive-ui'
import { NConfigProvider, dateZhCN, zhCN } from 'naive-ui'

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
watch(() => systemState.isDark, (dark) => {
  data.theme = dark ? darkTheme : null
})
</script>
