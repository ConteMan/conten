import { defineStore } from 'pinia'

export const useRefreshState = defineStore('refresh', {
  state: () => {
    return {
      weather: false,
      wakatime: false,
    }
  },
  actions: {
    toggle(module: 'weather' | 'wakatime', status = false) {
      this[module] = status
    },
  },
})
