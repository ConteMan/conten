import { defineStore } from 'pinia'

export const useWindowState = defineStore('window',
  () => {
    const data = reactive({
      showSideBar: false,
    })
    const { showSideBar } = toRefs(data)

    function toggleSideBar(status: boolean | undefined = undefined) {
      if (typeof status !== 'undefined')
        data.showSideBar = status
      else
        data.showSideBar = !data.showSideBar
    }

    return {
      showSideBar,
      toggleSideBar,
    }
  },
  {
    persist: {
      key: 'window',
    },
  },
)
