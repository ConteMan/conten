<script setup lang="ts">
import { useDraggable, watchDebounced } from '@vueuse/core'
import { invokeApi } from '@renderer/utils/ipcMessage'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  dWidth: {
    type: Number,
    default: 200,
  },
  dHeight: {
    type: Number,
    default: 100,
  },
  showScroll: {
    type: Boolean,
    default: true,
  },
})

const data = reactive({
  name: props.name,
  x: 100,
  y: 200,
  width: props.dWidth,
  height: props.dHeight,

  clientXStart: 0,
  clientYStart: 0,
})

const key = `dashboard-drag-${props?.name}`

const getData = async () => {
  const res = await invokeApi({
    name: 'kv',
    data: {
      key,
    },
  })
  if (res) {
    const { x, y, width, height } = res.data
    data.x = x
    data.y = y
    data.width = width
    data.height = height
  }
}
getData()

const el = ref<HTMLElement | null>(null)
const resizeEl = ref<HTMLElement | null>(null)

const { x, y } = useDraggable(el, {
  initialValue: { x: data.x, y: data.y },
  preventDefault: true,
})
watch([x, y], () => {
  data.x = x.value
  data.y = y.value
})

const dealStyle = computed(() => {
  return {
    left: `${data.x > 0 ? data.x : 0}px`,
    top: `${data.y - 32 > 0 ? data.y - 32 : 0}px`,
    width: `${data.width}px`,
    height: `${data.height}px`,
  }
})

const resize = (x: number, y: number) => {
  const computedX = x - data.clientXStart
  data.width += computedX
  data.clientXStart = x

  const computedY = y - data.clientYStart
  data.height += computedY
  data.clientYStart = y
}

onMounted(() => {
  resizeEl.value?.addEventListener('mousedown', (e) => {
    data.clientXStart = e.clientX
    data.clientYStart = e.clientY
    e.preventDefault()

    document.onmousemove = (e) => {
      resize(e.clientX, e.clientY)
    }

    document.onmouseup = (e) => {
      document.onmouseup = null
      document.onmousemove = null
    }
  })
})

const saveData = async (data: any) => {
  await invokeApi({
    name: 'kv-save',
    data: {
      key,
      data,
    },
  })
}

const storageObj = computed(() => {
  return {
    x: data.x,
    y: data.y,
    width: data.width,
    height: data.height,
  }
})

watchDebounced(storageObj,
  () => {
    saveData(storageObj.value)
  },
  { debounce: 500 })

const dealClass = computed(() => {
  return [
    props.showScroll ? 'overflow-auto' : 'overflow-auto hover-scroll',
  ]
})
</script>

<template>
  <div
    class="drag-container flex flex-col absolute z-auto hover:(shadow shadow-sm shadow-gray-400)"
    :class="dealClass"
    :style="dealStyle"
  >
    <div
      ref="el"
      class="drag-bar h-[20px] w-full flex-grow-0 cursor-move"
    />
    <div class="flex-grow overflow-auto hover-scroll">
      <slot />
    </div>
    <div
      ref="resizeEl"
      class="resize-btn absolute flex bottom-0 right-0 cursor-pointer opacity-0"
    >
      <mdi-arrow-bottom-right-thick />
    </div>
  </div>
</template>

<style lang="less">
.drag-container {
  font-family: 'JetBrainsMono';
  &:hover {
    .resize-btn{
      opacity: 100;
    }
  }
}
</style>
