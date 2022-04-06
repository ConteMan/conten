<template>
  <n-config-provider
    class="config-container"
    :theme-overrides="themeOverrides"
    :locale="zhCN"
    :date-locale="dateZhCN"
  >
    <n-notification-provider>
      <n-message-provider placement="top-right">
        <AppContent />
      </n-message-provider>
    </n-notification-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import type { GlobalThemeOverrides } from 'naive-ui'
import { NConfigProvider, dateZhCN, zhCN } from 'naive-ui'
import AppContent from './layout/AppContent.vue'

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
</script>
