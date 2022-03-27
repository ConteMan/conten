<template>
  <div ref="dragBar" class="top-bar h-4 w-full">
    <span></span>
  </div>
  <div class="flex flex-col items-center mt-4">
    <div class="p-2"> HTTP Server </div>
    <div class="space-x-2">
      <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="start()">Start</span>
      <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="stop()">Stop</span>
    </div>
  </div>
  <div class="flex flex-col items-center mt-4">
    <div class="p-2"> Dialog </div>
    <div class="space-x-2">
      <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="openFolder()">Open Folder</span>
      <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="getUserDataPath()">Get UserData Path</span>
    </div>
  </div>
  <div class="flex flex-col mt-8 px-4" v-html="showText">
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMousePressed } from '@vueuse/core'

const showText = ref('')
const dragBar = ref(null)

const { pressed } = useMousePressed({ target: dragBar })

watch(pressed, (newValue) => {
  window.ipcRenderer.send('indexMsg', { type: 'drag-bar-pressed', data: newValue })
})

const start = () => {
  window.ipcRenderer.send('indexMsg', { type: 'start', data: null })
}
const stop = () => {
  window.ipcRenderer.send('indexMsg', { type: 'stop', data: null })
}
const openFolder = () => {
  window.ipcRenderer.send('indexMsg', { type: 'open-folder', data: null })
}
const getUserDataPath = () => {
  window.ipcRenderer.send('indexMsg', { type: 'get-user-data-path', data: null })
}

window.ipcRenderer.on('indexMsg', (event, arg) => {
  console.log(arg)
  switch (arg.type) {
    case 'get-user-data-path':
      showText.value = showText.value + '<br>' + arg.data
      break
    default:
      break
  }
})

</script>
<style>
.top-bar {
  -webkit-app-region: drag;
}
</style>
