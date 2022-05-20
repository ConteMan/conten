import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'

import { storeInit } from './store/init'

import 'animate.css'
import 'vue-json-pretty/lib/styles.css'
import 'virtual:windi.css'
import './style/index.css'

createApp(App)
  .use(store)
  .use(router)
  .mount('#app')
  .$nextTick(window.removeLoading)

storeInit()
