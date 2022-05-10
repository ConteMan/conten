<script setup lang="ts">
import { useMousePressed } from '@vueuse/core'
import { sendToMain } from '@renderer/utils/ipcMessage'

const dragBarRef = ref(null)

const { pressed } = useMousePressed({ target: dragBarRef })

watch(pressed, (newValue) => {
  sendToMain('drag-bar-pressed', newValue)
})
</script>

<template>
  <div ref="dragBarRef" class="drag w-full h-[32px]">
    <span />
  </div>
</template>
