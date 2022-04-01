<template>
  <div ref="dragBar" class="top-bar h-4 w-full">
    <span></span>
  </div>
  <div class="flex flex-col items-center mt-4">
    <div class="p-2"> HTTP Server </div>
    <div class="space-x-2">
      <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="command('start-koa')">Start Koa</span>
      <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="command('stop-koa')">Stop Koa</span>
    </div>
  </div>
  <div class="flex flex-col items-center mt-4">
    <div class="p-2"> Test </div>
    <div class="space-x-2">
      <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="command('open-folder')">Open Folder</span>
      <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="command('get-user-data-path')">Get UserData Path</span>
    </div>
    <div class="space-x-2 mt-2">
      <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="invoke('getStore', 'server')">Get Store</span>
      <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="invoke('overwriteStore')">Overwrite Store</span>
      <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="invoke('changeDB')">Change DB</span>
      <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="invoke('getStorePath')">Get Store Path</span>
    </div>
  </div>
  <div class="flex flex-col mt-8 px-4" v-html="showText">
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMousePressed } from '@vueuse/core'
import { isObject } from './utils'

const showText = ref('')
const dragBar = ref(null)

const { pressed } = useMousePressed({ target: dragBar })

const command = (type = '', data: any = null) => {
  window.ipcRenderer.send('indexMsg', { type, data })
}

watch(pressed, (newValue) => {
  command('drag-bar-pressed', newValue)
})

window.ipcRenderer.on('indexMsg', (event, arg) => {
  console.log(arg)
  switch (arg.type) {
    case 'get-user-data-path':
      showText.value = showText.value + '<br>' + arg.data
      break
    default:
      showText.value = showText.value + '<br>' + (isObject(arg.data) ? JSON.stringify(arg.data) : arg.data)
      break
  }
})

const invoke = async(command: string, key: any = '') => {
    window.ipcRenderer.invoke(command, key).then(res => {
    showText.value = showText.value + '<br>' + JSON.stringify(res)
  })
}
</script>
<style>
.top-bar {
  -webkit-app-region: drag;
}
</style>
