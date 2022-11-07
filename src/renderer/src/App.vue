<script setup lang="ts">
import { API, WINDOW_NAME } from '@constants/index'
import { ipcApi } from '@renderer/api'

const isPinTop = ref(false)

const pinTop = async () => {
  isPinTop.value = await ipcApi({
    name: API.WINDOW_PIN_TOP,
    args: {
      moduleName: WINDOW_NAME.APP,
    },
  })
}
</script>

<template>
  <div class="flex flex-col w-full h-screen max-h-screen">
    <div class="drag flex-shrink-0 flex-grow-0 w-full h-[32px] flex items-center justify-end gap-4">
      <mdi-pin class="cursor-pointer mr-8" :class="[isPinTop ? 'rotate-45' : '']" @click="pinTop()" />
    </div>
    <router-view class="h-[calc(100% - 32px)] flex-grow flex-shrink overflow-auto" />
  </div>
</template>
