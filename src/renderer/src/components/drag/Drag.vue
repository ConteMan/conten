<script setup lang="ts">
import { useDraggable, useStorage, watchDebounced } from '@vueuse/core'

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
})

const storageValue = useStorage(`drag-${props?.name}`, {} as any)

const data = reactive({
  name: props.name,
  x: storageValue.value?.x ?? 100,
  y: storageValue.value?.y ?? 200,
  width: storageValue.value?.width ?? props.dWidth,
  height: storageValue.value?.height ?? props.dHeight,
  clientXStart: 0,
  clientYStart: 0,
})

const el = ref<HTMLElement | null>(null)
const resizeEl = ref<HTMLElement | null>(null)

const { x, y } = useDraggable(el, {
  initialValue: { x: data.x, y: data.y },
  preventDefault: true,
})
data.x = x
data.y = y

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

const storageObj = computed(() => {
  return {
    x: data.x,
    y: data.y,
    width: data.width,
    height: data.height,
  }
})
storageValue.value = storageObj.value

watchDebounced(storageObj,
  () => {
    storageValue.value = storageObj.value
  }, { debounce: 500 })
</script>

<template>
  <div
    class="drag-container absolute overflow-auto z-auto hover:(shadow shadow-sm shadow-gray-400)"
    :style="dealStyle"
  >
    <div
      ref="el"
      class="drag-bar h-[20px] w-full cursor-move"
    />
    <slot />
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
