import { defineStore } from 'pinia'

export const useRefreshState = defineStore('refresh', {
  state: () => {
    return {
      weather: false,
      wakatime: false,
      taptap: false,
    }
  },
  actions: {
    toggle(module: 'weather' | 'wakatime' | 'taptap', status = false) {
      this[module] = status
    },
  },
})
