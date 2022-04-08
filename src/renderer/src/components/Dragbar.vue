<template>
  <div ref="dragBarRef" class="drag w-full h-[40px]">
    <span></span>
  </div>
</template>
<script setup lang="ts">
import { useMousePressed } from '@vueuse/core'
import { sendToRenderer } from '@renderer/utils/ipcMessage'

const dragBarRef = ref(null)

const { pressed } = useMousePressed({ target: dragBarRef })

watch(pressed, (newValue) => {
  sendToRenderer('drag-bar-pressed', newValue)
})
</script>
