<script setup lang='ts'>
import { API, WINDOW_NAME, WINDOW_STORE_KEY } from '@constants/index'
import { ipcApi } from '@renderer/api'

const isPinTop = ref(false)

const getWindowStore = async () => {
  const res = await ipcApi({
    name: API.GET_STORE,
    args: {
      key: WINDOW_STORE_KEY.ROOT,
    },
  })
  if (res)
    isPinTop.value = res[WINDOW_STORE_KEY.PIN_TOP.replace(`${WINDOW_STORE_KEY.ROOT}.`, '')]
}
getWindowStore()

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
  <mdi-pin class="cursor-pointer" :class="[isPinTop ? 'rotate-45' : '']" @click="pinTop()" />
</template>

