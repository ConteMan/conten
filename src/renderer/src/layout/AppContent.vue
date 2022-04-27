<template>
<div class="flex w-full h-screen max-h-screen">
  <div
    class="h-screen max-h-screen"
    :style="{ width: `${sideWidth}px`, 'min-width': `${sideWidth}px`, 'max-width': `${sideWidth}px` }"
  >
    <Dragbar />
    <div class="mt-[100px]">
      <div class="nav-container mt-4 flex flex-col items-end py-2 text-white font-bold space-y-3">
        <template v-for="item in navList" :key="item.path">
          <div
            class="cursor-pointer text-gray-400 px-2 hover:(underline decoration-2 underline-offset-4)"
            :class="{ active: $route.path === item.path }" @click="$router.push({ path: item.path })"
          >
            {{ item.name }}
          </div>
        </template>
      </div>
    </div>
  </div>

  <div ref="resizeRef" class="drag-line flex-grow-0 w-[1px] cursor-col-resize">
    <span></span>
  </div>

  <div class="flex-grow h-screen max-h-screen overflow-hidden">
    <Dragbar />
    <div class="h-[calc(100%-32px)] overflow-auto px-4">
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
  {
    name: '状态',
    path: '/status',
  }
]

const resizeRef = ref<HTMLDivElement | null>(null)
const data = reactive({
  sideWidth: 120,
  sideMaxWidth: 240,
  sideMinWidth: 96,
  clientStartX: 0,
})
const { sideWidth } = toRefs(data)

const moveHandle = (nowClientX: number) => {
  const computedX = nowClientX - data.clientStartX;
  let changeWidth = data.sideWidth + computedX;

  if (changeWidth < data.sideMinWidth) {
    changeWidth = data.sideMinWidth;
  }

  if (changeWidth > data.sideMaxWidth) {
    changeWidth = data.sideMaxWidth;
  }
  data.sideWidth = changeWidth;
  data.clientStartX = nowClientX;
}

onMounted(() => {
  resizeRef.value?.addEventListener('mousedown', (e) => {
    data.clientStartX = e.clientX;
    e.preventDefault()

    document.onmousemove = e => {
      moveHandle(e.clientX);
    }

    document.onmouseup = e => {
      document.onmouseup = null;
      document.onmousemove = null;
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

<style scoped>
.cursor-col-resize {
  cursor: col-resize;
}
.active {
  color: rgba(163, 0, 0, 0.9);
}
.drag-line {
  opacity: 0.1;
  transition: opacity 0.2s linear;
  background-color: rgba(163, 0, 0, 0.92);
}
.drag-line:hover {
  opacity: 1;
  transition: opacity 0.2s linear 0.2s;
  background-color: rgba(163, 0, 0, 0.92);
}
</style>
