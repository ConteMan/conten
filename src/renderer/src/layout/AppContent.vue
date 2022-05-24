<script lang="ts" setup>
import type { MessageType } from 'naive-ui'
import { useMousePressed } from '@vueuse/core'
import { useRefreshState } from '@renderer/store/refresh'
import { useSystemState } from '@renderer/store/system'

// 导航栏
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
  {
    name: '关于',
    path: '/about',
  },
]

// 导航栏拖拽调节宽度
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
  }
  else if (changeWidth > data.sideMaxWidth) {
    changeWidth = data.sideMaxWidth
    data.clientStartX = data.sideMaxWidth
  }
  else {
    data.clientStartX = nowClientX
  }
  data.sideWidth = changeWidth
}

onMounted(() => {
  resizeRef.value?.addEventListener('mousedown', (e) => {
    data.clientStartX = e.clientX
    data.onResize = true
    e.preventDefault()

    document.onmousemove = (e) => {
      moveHandle(e.clientX)
    }

    document.onmouseup = (e) => {
      data.onResize = false
      document.onmouseup = null
      document.onmousemove = null
    }
  })
})

// 消息通知
const types: MessageType[] = [
  'success',
  'info',
  'warning',
  'error',
  'loading',
  'default',
]
const message = useMessage()

window.ipcRenderer.on('message', (event, arg) => {
  const { type, data } = arg
  message.create(`${data}`, {
    type: types[type],
    duration: 5000,
  })
})

// 状态更新
const refreshState = useRefreshState()
window.ipcRenderer.on('refresh', (event, data) => {
  const { module } = data
  refreshState.toggle(module, true)
})

// 系统状态
const systemState = useSystemState()
const { showSideNav } = storeToRefs(systemState)

window.ipcRenderer.on('store', (event, data) => {
  if (Object.keys(data)) {
    const keys = Object.keys(data)
    if (keys.includes('themeWithSystem'))
      systemState.toggleThemeWithSystem(data.themeWithSystem)
    if (keys.includes('isTop'))
      systemState.toggleTop(data.isTop)
  }
})

const { pressed: resizePressed } = useMousePressed({ target: resizeRef })
</script>

<template>
  <div
    class="flex w-full h-screen max-h-screen"
    :class="{ 'cursor-col-resize-important': onResize }"
  >
    <div
      class="h-screen max-h-screen sidebar-container"
      :class="{ 'sidebar-transition': !resizePressed }"
      :style="{ 'width': `${showSideNav ? sideWidth : 0}px`, 'min-width': `${showSideNav ? sideWidth : 0}px`, 'max-width': `${showSideNav ? sideWidth : 0}px` }"
    >
      <Dragbar />
      <Transition name="sidebar-content">
        <div v-if="showSideNav" class="sidebar-content mt-[80px]">
          <div class="nav-container flex flex-col items-center space-y-2">
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
      </Transition>
    </div>

    <Transition name="resize" appear>
      <div
        v-show="showSideNav"
        ref="resizeRef"
        class="flex-grow-0 flex flex-col justify-end w-[1px] cursor-col-resize"
        :style="{ width: `${showSideNav ? 1 : 0}px` }"
      >
        <div class="h-[32px] w-[1px] bg-gray-100" />
        <div class="h-[calc(100%-32px)] w-[1px] bg-gray-100" />
      </div>
    </Transition>

    <div class="relative flex-grow h-screen max-h-screen overflow-hidden">
      <div class="h-full flex flex-col">
        <Dragbar />
        <router-view v-slot="{ Component }" class="flex-grow flex-shrink overflow-auto">
          <keep-alive>
            <component :is="Component" v-if="$route.meta.keepAlive" />
          </keep-alive>
          <component :is="Component" v-if="!$route.meta.keepAlive" />
        </router-view>
      </div>
      <Menubar class="absolute bottom-0 w-full" />
    </div>
  </div>
</template>

<style scoped lang="less">
.cursor-col-resize {
  cursor: col-resize;
}
.cursor-col-resize-important {
  cursor: col-resize !important;
}
.sidebar-transition {
  transition: width 0.5s, min-width 0.5s, max-width 0.5s;
}
.sidebar-content-enter-active {
  transition: opacity 0.5s ease 0.3s;
}
.sidebar-content-leave-active {
  transition: opacity 0;
}
.sidebar-content-enter-from,
.sidebar-content-leave-to {
  opacity: 0;
}

.resize-enter-active {
  transition: opacity 0.5s ease 0.3s;
}
.resize-enter-from {
  opacity: 0;
}
</style>
