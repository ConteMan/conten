<script setup lang="ts">
import dayjs from 'dayjs'
import { useRefreshState } from '@renderer/store/refresh'
import { invokeApi } from '@renderer/utils/ipcMessage'

const module = 'wakatime'

const data = reactive({
  enable: false,
  summaries: null as any,
  summariesExpired: null as any,
  summariesUpdatedAt: null as any,
})
const { enable, summaries, summariesUpdatedAt } = toRefs(data)

const moduleEnable = async () => {
  const res = await invokeApi({
    name: 'module-enable',
    data: {
      module,
    },
  })
  data.enable = res
  return res
}

const getSummaries = async (refresh = false) => {
  const res = await invokeApi({
    name: 'wakatime-summaries',
    data: {
      range: 'Today',
      refresh,
    },
  })

  data.summaries = res.data
  data.summariesExpired = res.expired
  data.summariesUpdatedAt = res.updated_at
}

const init = async () => {
  const enable = await moduleEnable()
  if (enable)
    await getSummaries()
}
init()

const refreshState = useRefreshState()
watch(() => refreshState[module], async () => {
  await getSummaries()
})
</script>

<template>
  <div
    v-if="enable && summaries"
    class="wakatime-card p-2"
  >
    <div>
      <span>[ WakaTime ]</span>
      <span
        class="wakatime-data-time invisible text-xs text-gray-400 italic cursor-pointer ml-2"
        @click="getSummaries(true)"
      >
        {{ dayjs(summariesUpdatedAt).format('HH:mm') }}
      </span>
    </div>
    <div>
      <span>
        今日开发时间：{{ summaries.cummulative_total.text }}.
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
