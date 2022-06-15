<script setup lang="ts">
import { useRefreshState } from '@renderer/store/refresh'
import { invokeApi } from '@renderer/utils/ipcMessage'

const data = reactive({
  module: 'taptap',
  enable: false,
  detail: null as any,
})
const { module, enable, detail } = toRefs(data)

const moduleEnable = async () => {
  const res = await invokeApi({
    name: 'module-enable',
    data: {
      module: module.value,
    },
  })
  data.enable = res
  return res
}

const getDetail = async (refresh = false) => {
  const detailRes = await window.ipcRenderer.invoke('api', {
    name: 'taptap-detail',
    data: {
      refresh,
    },
  })
  data.detail = detailRes.data.data ?? null
}

const init = async () => {
  const enable = await moduleEnable()
  if (enable)
    await getDetail()
}
init()

const refreshState = useRefreshState()
watch(() => refreshState.taptap, (val) => {
  if (val) {
    getDetail(true)
    refreshState.toggle('taptap', false)
  }
})
</script>

<template>
  <div v-if="enable && detail" class="p-2">
    <div>
      <span class="pb-1">[ {{ detail[1].data.data[0].app.title }} ]</span>
    </div>
    <div>
      <span class="ml-1">{{ detail[1].data.data[0].played_tips }}</span>
    </div>
  </div>
</template>
