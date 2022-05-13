<script setup lang="ts">
import { useNow } from '@vueuse/core'

const now = useNow()
</script>

<template>
  <div class="now-card p-2 text-gray-400 text-xs">
    {{ now }}
  </div>
</template>

<style scoped>
.now-card {
  font-family: 'JetBrainsMono';
}
</style>
