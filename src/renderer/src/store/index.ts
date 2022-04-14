import { createPinia } from 'pinia'
import piniaPluginPersist from 'pinia-plugin-persistedstate'

const store = createPinia().use(piniaPluginPersist)

export default store
