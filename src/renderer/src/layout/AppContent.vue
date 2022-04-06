<template>
<div class="flex w-full h-screen">
  <div
    class="w-min-[calc(24px+72px)] h-screen bg-light-800"
    :style="{ width: `${sideWidth}px`, 'min-width': `${sideMinWidth}px`, 'max-width': `${sideMaxWidth}px` }">
    <div class="mt-[100px]">
      <div class="nav-container mt-4 flex flex-col items-end py-2 text-white font-bold space-y-3">
        <template v-for="item in navList" :key="item.path">
          <div
            class="cursor-pointer px-2 hover:(underline decoration-2 underline-offset-4)"
            :class="{ active: $route.path === item.path }" @click="$router.push({ path: item.path })"
          >
            {{ item.name }}
          </div>
        </template>
      </div>
    </div>
  </div>
  <div ref="resizeRef" class="flex-grow-0 w-[2px] bg-light-800 cursor-col-resize hover:(bg-gray-400) active:(bg-gray-400)">
    <span></span>
  </div>
  <div class="flex-grow px-4">
    <router-view />
  </div>
</div>
</template>
<script lang="ts" setup>
const navList = [
  {
    name: '实验',
    path: '/test',
  },
  {
    name: '设置',
    path: '/setting',
  }
]

const resizeRef = ref<HTMLDivElement | null>(null)
const data = reactive({
  sideWidth: 120,
  sideMaxWidth: 240,
  sideMinWidth: 96,
  clientStartX: 0,
})
const { sideWidth, sideMinWidth, sideMaxWidth } = toRefs(data)

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
</script>

<style scoped>
.cursor-col-resize {
  cursor: col-resize;
}
.active {
  color: black;
}
</style>
