<template>
  <div class="px-4 pt-8">
    <div class="flex flex-col items-start">
      <div class="p-2"> System </div>
      <div class="space-x-2">
        <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="invoke('pin-top')">Pin Top</span>
        <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="toggleDark()">{{ isDark ? 'Dark' : 'Light' }}</span>
      </div>
      <div class="space-x-2 mt-4">
          <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="command('get-user-data-path')">Get UserData Path</span>
          <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="invoke('get-package-info')">Get Package Info</span>
      </div>
    </div>
    <div class="flex flex-col items-start mt-4">
      <div class="p-2"> Koa Server </div>
      <div class="space-x-2">
        <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="command('start-koa')">Start Koa</span>
        <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="command('stop-koa')">Stop Koa</span>
      </div>
    </div>
    <div class="flex flex-col items-start mt-4">
      <div class="p-2"> Store </div>
      <div class="space-x-2">
        <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="invoke('getStorePath')">Get Store Path</span>
        <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="invoke('getStore', 'server')">Get Store</span>
      </div>
    </div>
    <div class="flex flex-col items-start mt-4">
      <div class="p-2"> DB </div>
      <div class="space-x-2">
        <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="invoke('sqlite3')">Sqlite3 Get</span>
        <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="command('get-user')">MongoDB Get</span>
      </div>
    </div>
    <div class="flex flex-col items-start mt-4">
      <div class="p-2"> Weather </div>
      <div class="space-x-2">
        <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="invoke('get-weather')">Get CMA Weather</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'
import { useSystemState } from '@renderer/store/system'


const command = (type = '', data: any = null) => {
  window.ipcRenderer.send('indexMsg', { type, data })
}

window.ipcRenderer.on('indexMsg', (event, arg) => {
  console.log(arg)
})

const invoke = async(command: string, key: any = '') => {
    window.ipcRenderer.invoke(command, key).then(res => {
    console.log(res)
  })
}

const systemState = useSystemState()
const isDark = useDark({
  onChanged(dark: boolean) {
    systemState.toggleDark(dark)
  }
})
const toggleDark = useToggle(isDark)
</script>
