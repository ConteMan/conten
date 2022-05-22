import { invokeApi } from '@renderer/utils/ipcMessage'
import { useSystemState } from '@renderer/store/system'

export async function storeInit() {
  const configStore: any = await invokeApi({
    name: 'config-store',
  })

  if (configStore) {
    if (Object.keys(configStore).includes('themeWithSystem')) {
      const systemState = useSystemState()
      systemState.toggleThemeWithSystem(configStore.themeWithSystem)
    }
    if (Object.keys(configStore).includes('isTop')) {
      const systemState = useSystemState()
      systemState.toggleTop(configStore.isTop)
    }
  }
}
