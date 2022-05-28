import { defineStore } from 'pinia'

export const useRefreshState = defineStore('refresh', {
  state: () => {
    return {
      weather: false,
      wakatime: false,
      taptap: false,
      v2ex: false,
    }
  },
  actions: {
    toggle(module: 'weather' | 'wakatime' | 'taptap' | 'v2ex', status = false) {
      this[module] = status
    },
  },
})
