import { defineStore } from 'pinia'

export const useSystemState = defineStore('system', {
  state: () => {
    return {
      isDark: false,
      showSideNav: true,
    }
  },
  actions: {
    toggleDark(status = false) {
      this.isDark = status
    },
    toggleSideNav(status = false) {
      this.showSideNav = status
    },
  },
})
