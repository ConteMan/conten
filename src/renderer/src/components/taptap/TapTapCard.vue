<script setup lang="ts">
import dayjs from 'dayjs'
import { useRefreshState } from '@renderer/store/refresh'
import { invokeApi } from '@renderer/utils/ipcMessage'

const module = 'taptap'

const data = reactive({
  enable: false,
  detail: null as any,
  updatedAt: '',
})
const { enable, detail, updatedAt } = toRefs(data)

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

const getDetail = async (refresh = false) => {
  const res = await window.ipcRenderer.invoke('api', {
    name: 'taptap-detail',
    data: {
      refresh,
    },
  })
  data.detail = res.data.data ?? null
  data.updatedAt = res.updated_at
}

const init = async () => {
  const enable = await moduleEnable()
  if (enable)
    await getDetail()
}
init()

const refreshState = useRefreshState()
watch(() => refreshState[module], async () => {
  await getDetail()
})
</script>

<template>
  <div v-if="enable && detail" class="hover-show-parent p-2">
    <div>
      <span class="pb-1">[ {{ detail[1].data.data[0].app.title }} ]</span>
      <span class="hover-show invisible text-xs text-gray-400 italic ml-2">
        {{ dayjs(updatedAt).format('HH:mm') }}
      </span>
    </div>
    <div>
      <span>{{ detail[1].data.data[0].played_tips }}</span>
    </div>
  </div>
</template>

<style>
.hover-show-parent:hover .hover-show{
  visibility: visible;
}
</style>
