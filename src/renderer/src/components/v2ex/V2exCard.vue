<script setup lang="ts">
import dayjs from 'dayjs'
import { useRefreshState } from '@renderer/store/refresh'
import { invokeApi } from '@renderer/utils/ipcMessage'

const module = 'v2ex'

const data = reactive({
  enable: false,
  info: null as any,
  updated_at: null as any,
})
const { enable, info, updated_at } = toRefs(data)

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

const getModuleInfo = async (refresh = false) => {
  const res = await invokeApi({
    name: 'module-info',
    data: {
      module,
      refresh,
    },
  })

  if (res) {
    // eslint-disable-next-line no-console
    console.log(res)
    data.info = JSON.parse(res.value)
    data.updated_at = res.updated_at
  }
}

const init = async () => {
  const enable = await moduleEnable()
  if (enable)
    await getModuleInfo()
}
init()

const refreshState = useRefreshState()
watch(() => refreshState.v2ex, (val) => {
  if (val) {
    getModuleInfo(true)
    refreshState.toggle('v2ex', false)
  }
})
</script>

<template>
  <div
    v-if="enable && info"
    class="v2ex-card p-2"
  >
    <div class="text-xs">
      <span>
        [ V2EX ] {{ info.login ? 'online' : 'offline' }}.
      </span>
      <span
        class="v2ex-data-time invisible text-xs text-gray-400 italic cursor-pointer ml-2"
        @click="getModuleInfo(true)"
      >
        {{ dayjs(updated_at).format('HH:mm') }}
      </span>
    </div>
  </div>
</template>

<style lang="less">
.v2ex-card:hover {
  .v2ex-data-time {
    visibility: visible;
  }
}
</style>
