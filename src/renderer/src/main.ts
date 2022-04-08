import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import 'vue-json-pretty/lib/styles.css';
import 'virtual:windi.css'
import './style/index.css'

createApp(App)
  .use(router)
  .mount('#app')
  .$nextTick(window.removeLoading)

console.log('fs', window.fs)
console.log('ipcRenderer', window.ipcRenderer)
