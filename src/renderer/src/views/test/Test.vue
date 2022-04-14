<template>
  <div class="flex flex-col items-start mt-4">
    <div class="p-2"> System </div>
    <div class="space-x-2">
      <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="invoke('pin-top')">Pin Top</span>
      <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="toggleDark()">{{ isDark ? 'Dark' : 'Light' }}</span>
    </div>
  </div>
  <div class="flex flex-col items-start mt-4">
    <div class="p-2"> HTTP Server </div>
    <div class="space-x-2">
      <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="command('start-koa')">Start Koa</span>
      <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="command('stop-koa')">Stop Koa</span>
    </div>
  </div>
  <div class="flex flex-col items-start mt-4">
    <div class="p-2"> Test </div>
    <div class="space-x-2">
      <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="command('open-folder')">Open Folder</span>
      <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="command('get-user-data-path')">Get UserData Path</span>
    </div>
    <div class="space-x-2 mt-4">
      <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="invoke('getStore', 'server')">Get Store</span>
      <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="invoke('overwriteStore')">Overwrite Store</span>
      <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="invoke('set-command')">Set Command</span>
      <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="invoke('getStorePath')">Get Store Path</span>
    </div>
  </div>
  <div class="flex flex-col items-start mt-4">
    <div class="p-2"> MongoDB </div>
    <div class="space-x-2">
      <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="command('get-user')">Get</span>
    </div>
  </div>
  <div class="flex flex-col mt-8" v-html="showText">
  </div>
</template>

<script setup lang="ts">
import { useDark, useToggle, useMediaQuery } from '@vueuse/core'
import { isObject } from '../../utils'
import { useSystemState } from '../../store/system'

const showText = ref('')

const command = (type = '', data: any = null) => {
  window.ipcRenderer.send('indexMsg', { type, data })
}

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

const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
watch(prefersDark, (newVal) => {
  isDark.value = newVal
})

const systemState = useSystemState()
const isDark = useDark({
  onChanged(dark: boolean) {
    systemState.toggleDark(dark)
  }
})
const toggleDark = useToggle(isDark)
</script>
