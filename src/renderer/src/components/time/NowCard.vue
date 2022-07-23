<script setup lang="ts">
import { useNow } from '@vueuse/core'
import dayjs from 'dayjs'

const now = useNow()
</script>

<template>
  <div class="now-card px-4">
    [ {{ dayjs(now).format('YYYY MMMM DD / dddd ') }} / <span class="text-[20px] font-bold text-red-600 text-shadow-xl">{{ dayjs(now).format('HH:mm:ss') }}</span> ]
  </div>
</template>

<style scoped>
.now-card {
  font-family: 'JetBrainsMono';
}
</style>
