import { createPinia } from 'pinia'
import piniaPluginPersist from 'pinia-plugin-persistedstate'
import { useWindowState } from './window'

const store = createPinia().use(piniaPluginPersist)

export default store

export {
  useWindowState,
}
