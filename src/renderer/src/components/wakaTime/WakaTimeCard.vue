<script setup lang="ts">
import dayjs from 'dayjs'

const data = reactive({
  summaries: null as any,
  summariesExpired: null as any,
  summariesUpdatedAt: null as any,
})
const { summaries, summariesUpdatedAt } = toRefs(data)

const init = async () => {
  const res = await window.ipcRenderer.invoke('api', {
    name: 'wakatime-summaries',
    data: {
      range: 'Today',
    },
  })

  data.summaries = res.data
  data.summariesExpired = res.expired
  data.summariesUpdatedAt = res.updated_at
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
        Code Time
      </span>
      <span class="wakatime-data-time invisible text-xs text-gray-400 italic ml-2">
        {{ dayjs(summariesUpdatedAt).format('HH:mm') }}
      </span>
    </div>
    <div>
      <span class="weather-data-time text-xs text-gray-400">
        {{ summaries.cummulative_total.text }}
      </span>
    </div>
  </div>
</template>

<style lang="less">
.wakatime-card:hover {
  .wakatime-data-time {
    visibility: visible;
  }
}
</style>
