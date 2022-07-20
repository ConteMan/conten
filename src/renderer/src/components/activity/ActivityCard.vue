<script setup lang="ts">
const data = ref('')

window.ipcRenderer.on('activity', (event, msg) => {
  // eslint-disable-next-line no-console
  console.log('>>> renderer >> components > activity', msg)
  data.value = msg
})
</script>

<template>
  <div class="px-4">
    <div class="mb-2">
      [ Activity ]
    </div>
    <div>{{ data }}</div>
  </div>
</template>
