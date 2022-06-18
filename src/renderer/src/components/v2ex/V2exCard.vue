<script setup lang="ts">
import dayjs from 'dayjs'
import { useRefreshState } from '@renderer/store/refresh'
import { invokeApi } from '@renderer/utils/ipcMessage'

const module = 'v2ex'

const data = reactive({
  enable: false,
  info: null as any,
  updatedAt: '',
})
const { enable, info, updatedAt } = toRefs(data)

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
    data.info = JSON.parse(res.value)
    data.updatedAt = res.updated_at
  }
}

const init = async () => {
  const enable = await moduleEnable()
  if (enable)
    await getModuleInfo()
}
init()

// 开启新窗口
const openWindow = (url: string) => {
  invokeApi({
    name: 'open-new-window',
    data: {
      url,
    },
  })
}

const refreshState = useRefreshState()
watch(() => refreshState[module], (val) => {
  getModuleInfo(true)
})
</script>

<template>
  <div
    v-if="enable && info"
    class="v2ex-card p-2"
  >
    <div class="">
      <span>
        [ V2EX ]
      </span>
      <span
        class="v2ex-data-time invisible text-xs text-gray-400 italic cursor-pointer ml-2"
        @click="getModuleInfo(true)"
      >
        {{ dayjs(updatedAt).format('HH:mm') }}
      </span>
    </div>
    <div>
      <span>{{ info.login ? 'Online' : '' }}</span>
      <span v-if="!info.login" class="cursor-pointer hover:(underline decoration-2 underline-offset-2)" @click="openWindow('https://v2ex.com')">offline</span> / {{ info.user.balance.gold }} {{ info.user.balance.silver }} {{ info.user.balance.bronze }}
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
