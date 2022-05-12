<script setup lang="ts">
import { useSystemState } from '@renderer/store/system'
import { storeToRefs } from 'pinia'

const command = (type = '', data: any = null) => {
  window.ipcRenderer.send('indexMsg', { type, data })
}

window.ipcRenderer.on('indexMsg', (event, arg) => {
  // eslint-disable-next-line no-console
  console.log(arg)
})

const invoke = async (command: string, key: any = '') => {
  window.ipcRenderer.invoke(command, key).then((res) => {
    // eslint-disable-next-line no-console
    console.log(res)
  })
}

const invokeApi = async (name: string, data: object = {}) => {
  window.ipcRenderer.invoke('api', {
    name,
    data,
  }).then((res) => {
    // eslint-disable-next-line no-console
    console.log(res)
  })
}

const systemState = useSystemState()
const { isDark } = storeToRefs(systemState)
const toggleDark = () => {
  systemState.toggleDark(!isDark.value)
}

const data = reactive({
  transitionWidth: 200,
  transitionShow: true,
  showTrafficButton: true,
})
const { transitionWidth, transitionShow, showTrafficButton } = toRefs(data)
const transitionTest = (mode = 'width') => {
  if (mode === 'width')
    data.transitionWidth = data.transitionWidth === 200 ? 400 : 200
  else
    data.transitionWidth = 0
}

const changeTrafficButton = async () => {
  await invokeApi('hide-traffic-button', { status: showTrafficButton.value })
  data.showTrafficButton = !data.showTrafficButton
}
</script>

<template>
  <div class="px-4 pb-8">
    <div class="flex flex-col items-start">
      <div class="p-2">
        System
      </div>
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
      <div class="p-2">
        Window
      </div>
      <div class="space-x-2">
        <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="changeTrafficButton()">Show/Hide Traffic Button</span>
        <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="invoke('init-view-window')">Init View Window</span>
        <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="invoke('get-view-cookie')">Get View Cookie</span>
        <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="invoke('hide-view-window')">Show/Hide View Window</span>
        <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="invokeApi('juejin-checkin')">Run Script View Window - Juejin Check In</span>
      </div>
    </div>
    <div class="flex flex-col items-start mt-4">
      <div class="p-2">
        Koa Server
      </div>
      <div class="space-x-2">
        <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="command('start-koa')">Start Koa</span>
        <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="command('stop-koa')">Stop Koa</span>
      </div>
    </div>
    <div class="flex flex-col items-start mt-4">
      <div class="p-2">
        Store
      </div>
      <div class="space-x-2">
        <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="invoke('getStorePath')">Get Store Path</span>
        <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="invoke('getStore', 'server')">Get Store</span>
      </div>
    </div>
    <div class="flex flex-col items-start mt-4">
      <div class="p-2">
        DB
      </div>
      <div class="space-x-2">
        <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="invoke('sqlite3')">Sqlite3 Get</span>
        <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="command('get-user')">MongoDB Get</span>
      </div>
    </div>
    <div class="flex flex-col items-start mt-4">
      <div class="p-2">
        Weather
      </div>
      <div class="space-x-2">
        <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="invoke('get-weather')">Get CMA Weather</span>
      </div>
    </div>
    <div class="flex flex-col items-start mt-4">
      <div class="p-2">
        WakaTime
      </div>
      <div class="space-x-2">
        <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="invoke('wakatime-summaries')">Summaries</span>
      </div>
    </div>
    <div class="flex flex-col items-start mt-4">
      <div class="p-2">
        Transition
      </div>
      <div class="space-x-2">
        <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="transitionTest()">Transition Width</span>
        <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="transitionTest('show')">Transition Show</span>
      </div>
      <div class="mt-2 w-full flex">
        <div
          class="transition-card flex-grow-0 py-1 text-light-400 rounded-md bg-black"
          :style="{ width: `${transitionWidth}px`, visibility: transitionShow ? 'visible' : 'hidden' }"
        >
          <Transition>
            <div
              v-show="transitionWidth > 0"
              class="overflow-hidden whitespace-nowrap px-2"
            >
              Card Left
            </div>
          </Transition>
        </div>
        <div class="flex-grow p-1 px-2 bg-red-400 rounded-md text-light-400">
          Card Right
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.transition-card {
  transition: width 0.5s ease-in-out, visibility 0.5s ease-in-out;
}
.transition-text {
  transition: opacity 0.5s;
}

.v-enter-active {
  transition: opacity 0.5s ease 0.5s;
}
.v-leave-active {
  transition: opacity 0;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
