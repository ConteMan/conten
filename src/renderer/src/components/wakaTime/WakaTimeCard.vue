<script setup lang="ts">
const data = reactive({
  summaries: null as any,
  summariesExpired: null as any,
})
const { summaries } = toRefs(data)

const init = async () => {
  const res = await window.ipcRenderer.invoke('api', {
    name: 'wakatime-summaries',
    data: {
      range: 'Today',
    },
  })

  data.summaries = res.data
  data.summariesExpired = res.expired
}

init()
</script>

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

<style lang="less">
.weather-card:hover {
  .weather-data-time {
    visibility: visible;
  }
}
</style>
