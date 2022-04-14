import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'

import 'vue-json-pretty/lib/styles.css';
import 'virtual:windi.css'
import './style/index.css'

createApp(App)
  .use(store)
  .use(router)
  .mount('#app')
  .$nextTick(window.removeLoading)

console.log('fs', window.fs)
console.log('ipcRenderer', window.ipcRenderer)
