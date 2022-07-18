<script setup lang="ts">
import { useNow } from '@vueuse/core'
import dayjs from 'dayjs'

const now = useNow()
</script>

<template>
  <div class="now-card">
    [ {{ dayjs(now).format('YYYY MMMM DD / dddd / HH:mm:ss ') }} ]
  </div>
</template>

<style scoped>
.now-card {
  font-family: 'JetBrainsMono';
}
</style>
