import { invokeApi } from '@renderer/utils/ipcMessage'
import { useSystemState } from '@renderer/store/system'

export async function storeInit() {
  const configStore: any = await invokeApi({
    name: 'config-store',
  })

  // eslint-disable-next-line no-console
  console.log('>>> configStore:', configStore)

  if (configStore) {
    if (Object.keys(configStore).includes('themeWithSystem')) {
      const systemState = useSystemState()
      systemState.toggleThemeWithSystem(configStore.themeWithSystem)
    }
  }
}
