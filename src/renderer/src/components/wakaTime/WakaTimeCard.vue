<template>
  <div
    v-if="summaries"
    class="wakatime-card p-2"
  >
    <div>
      <span class="font-bold cursor-pointer select-none">
        Today Code Time: 
      </span>
      <span class="weather-data-time ml-2 text-xs text-gray-400">
        {{ summaries.cummulative_total.text }}
      </span>
    </div>

  </div>
</template>

<script setup lang="ts">
const data = reactive({
  summaries: null as any,
})
const { summaries } = toRefs(data)

const init = async() => {
  const res = await window.ipcRenderer.invoke('wakatime-summaries')
  data.summaries = res
}

init()
</script>

<style lang="less">
.weather-card:hover {
  .weather-data-time {
    visibility: visible;
  }
}
</style>