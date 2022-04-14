import { defineStore } from 'pinia'

export const useSystemState = defineStore('system', {
  state: () => {
    return {
      isDark: false,
    }
  },
  actions: {
    toggleDark(status = false) {
      this.isDark = status
    },
  },
})
