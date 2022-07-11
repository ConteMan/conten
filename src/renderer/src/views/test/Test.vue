<script setup lang="ts">
const command = (type = '', data: any = null) => {
  window.ipcRenderer.send('indexMsg', { type, data })
}

window.ipcRenderer.on('indexMsg', (event, arg) => {
  // eslint-disable-next-line no-console
  console.log(arg)
})

const invokeApi = async (name: string, data: object = {}) => {
  window.ipcRenderer.invoke('api', {
    name,
    data,
  }).then((res) => {
    // eslint-disable-next-line no-console
    console.log(res)
  })
}

const data = reactive({
  transitionWidth: 200,
  transitionShow: true,
  showTrafficButton: true,
  tempInput: '',
})
const { transitionWidth, transitionShow, showTrafficButton, tempInput } = toRefs(data)
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
        TEMP
      </div>
      <div class="flex flex-wrap gap-2">
        <n-input v-model:value="tempInput" />
        <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="invokeApi('douban', { type: 'movie-search', data: tempInput })">豆瓣-影视搜索</span>
        <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="invokeApi('douban', { type: 'book', data: tempInput })">豆瓣-图书信息</span>
        <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="invokeApi('douban', { type: 'book-list', data: tempInput })">豆瓣-图书列表</span>
      </div>
    </div>
    <div class="flex flex-col items-start mt-4">
      <div class="p-2">
        Window
      </div>
      <div class="flex flex-wrap gap-2">
        <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="changeTrafficButton()">Show/Hide Traffic Button</span>
        <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="invokeApi('juejin-checkin')">Run Script View Window - Juejin Check In</span>
        <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="invokeApi('taptap-view-http-data')">Get View HTTP Data - TapTap</span>
        <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="invokeApi('taptap-view-http-data', { url: 'https://www.taptap.com/user/5827457/most-played' })">Get View HTTP Data - TapTap User</span>
      </div>
    </div>
    <div class="flex flex-col items-start mt-4">
      <div class="p-2">
        Koa Server
      </div>
      <div class="flex flex-wrap gap-2">
        <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="invokeApi('koa', { action: 'start' })">Start Koa</span>
        <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="invokeApi('koa', { action: 'stop' })">Stop Koa</span>
      </div>
    </div>
    <div class="flex flex-col items-start mt-4">
      <div class="p-2">
        DB
      </div>
      <div class="flex flex-wrap gap-2">
        <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="command('get-user')">MongoDB Get</span>
      </div>
    </div>
    <div class="flex flex-col items-start mt-4">
      <div class="p-2">
        Transition
      </div>
      <div class="flex flex-wrap gap-2">
        <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="transitionTest()">Transition Width</span>
        <span class="rounded-md cursor-pointer py-1 px-2 bg-dark-50 text-light-50 hover:(bg-light-800 text-black)" @click="transitionTest('show')">Transition Show</span>
      </div>
      <div class="mt-4 w-full flex">
        <div
          class="transition-card flex-grow-0 py-1 text-light-400 bg-blue-400"
          :style="{ width: `${transitionWidth}px`, visibility: transitionShow ? 'visible' : 'hidden' }"
        >
          <Transition>
            <div v-show="transitionWidth" class="overflow-hidden whitespace-nowrap px-2">
              Card Left
            </div>
          </Transition>
        </div>
        <div class="flex-grow p-1 px-2 bg-red-400 text-light-400">
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
