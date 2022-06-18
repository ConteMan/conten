import { defineStore } from 'pinia'

export const useRefreshState = defineStore('refresh', {
  state: (): Record<string, string> => {
    return {
      weather: '',
      wakatime: '',
      taptap: '',
      v2ex: '',
    }
  },
  actions: {
    toggle(module: string, status: string) {
      // eslint-disable-next-line no-console
      console.log('>>> store >> refresh > toggle', module, status)

      this[module] = status
    },
  },
  persist: {
    key: 'refresh',
  },
})
