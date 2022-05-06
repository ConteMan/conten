<template>
<div
  class="flex w-full h-screen max-h-screen"
  :class="{ 'cursor-col-resize-important': onResize }"
>
  <div
    class="h-screen max-h-screen sidebar-container"
    :style="{ width: `${sideWidth}px`, 'min-width': `${sideWidth}px`, 'max-width': `${sideWidth}px` }"
  >
    <Dragbar />
    <div class="mt-[80px]">
      <div class="nav-container flex flex-col items-end space-y-2">
        <div
          v-for="item in navList" :key="item.path"
          class="px-2 cursor-pointer hover:(underline decoration-2 underline-offset-4)"
          :class="{ 'font-bold text-red-600': $route.path === item.path }"
          @click="$router.push({ path: item.path })"
        >
          {{ item.name }}
        </div>
      </div>
    </div>
  </div>

  <div ref="resizeRef" class="flex-grow-0 flex justify-center w-[1px] cursor-col-resize">
    <div class="h-full w-[1px] bg-gray-200"></div>
  </div>

  <div class="flex-grow h-screen max-h-screen overflow-hidden">
    <div class="h-full overflow-auto">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" v-if="$route.meta.keepAlive" />
        </keep-alive>
        <component :is="Component" v-if="!$route.meta.keepAlive" />
      </router-view>
    </div>
  </div>
</div>
</template>

<script lang="ts" setup>
import { useMessage, MessageType } from 'naive-ui'

const navList = [
  {
    name: '面板',
    path: '/dashboard',
  },
  {
    name: '实验',
    path: '/test',
  },
  {
    name: '设置',
    path: '/setting',
  },
]

const resizeRef = ref<HTMLDivElement | null>(null)
const data = reactive({
  sideWidth: 82,
  sideMaxWidth: 240,
  sideMinWidth: 82,
  clientStartX: 0,
  onResize: false,
})
const { sideWidth, onResize } = toRefs(data)

const moveHandle = (nowClientX: number) => {
  const computedX = nowClientX - data.clientStartX
  let changeWidth = data.sideWidth + computedX

  if (changeWidth < data.sideMinWidth) {
    changeWidth = data.sideMinWidth
    data.clientStartX = data.sideMinWidth
  } else if (changeWidth > data.sideMaxWidth) {
    changeWidth = data.sideMaxWidth
    data.clientStartX = data.sideMaxWidth
  } else {
    data.clientStartX = nowClientX
  }
  data.sideWidth = changeWidth
}

onMounted(() => {
  resizeRef.value?.addEventListener('mousedown', (e) => {
    data.clientStartX = e.clientX
    data.onResize = true
    e.preventDefault()

    document.onmousemove = e => {
      moveHandle(e.clientX)
    }

    document.onmouseup = e => {
      data.onResize = false
      document.onmouseup = null
      document.onmousemove = null
    };
  })
})

const types: MessageType[] = [
  'success',
  'info',
  'warning',
  'error',
  'loading',
  'default'
]
const message = useMessage()

// 消息通知
window.ipcRenderer.on('message', (event, arg) => {
  console.log('[app content] > message >', arg)
  const { type, data } = arg
  message.create('' + data, {
    type: types[type],
    duration: 5000
  })
})

const route = useRoute()
watch(() => route.meta, (meta) => {
  console.log('[app content] > keep alive >', meta.keepAlive)
})
</script>

<style scoped lang="less">
.cursor-col-resize {
  cursor: col-resize;
}
.cursor-col-resize-important {
  cursor: col-resize !important;
}
</style>
