import { defineStore } from 'pinia'

export const useSystemState = defineStore('system', {
  state: () => {
    return {
      isDark: false,
      showSideNav: false,
      themeWithSystem: false, // 主题是否和系统一致
      isTop: false, // 是否窗口置顶
      showBar: true, // 是否显示状态栏
      hoverShowBar: false, // 是否鼠标悬停显示状态栏
      showSearch: false, // 是否显示搜索
    }
  },
  actions: {
    toggleDark(status = false) {
      this.isDark = status
    },
    toggleSideNav(status = false) {
      this.showSideNav = status
    },
    toggleThemeWithSystem(status = true) {
      this.themeWithSystem = status
      if (status) {
        const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
        this.isDark = !!prefersDark.value
      }
    },
    toggleTop(status = true) {
      this.isTop = status
    },
    toggleBar(status = true) {
      this.showBar = status
    },
    toggleHoverShowBar(status = true) {
      this.hoverShowBar = status
    },
    toggleSearch(status = true) {
      this.showSearch = status
    },
  },
  persist: {
    key: 'system',
  },
})
