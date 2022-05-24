<script setup lang="ts">
const data = reactive({

  detail: null as any,
})
const { detail } = toRefs(data)

const init = async (refresh = false) => {
  const detailRes = await window.ipcRenderer.invoke('api', {
    name: 'taptap-detail',
    data: {
      refresh,
    },
  })
  data.detail = detailRes.data.data ?? null
}

init()
</script>

<template>
  <div v-if="detail" class="p-2">
    <div>
      <span class="pb-1 text-xs">{{ detail[1].data.data[0].app.title }}</span>
      <span class="ml-1 text-xs">{{ detail[1].data.data[0].played_tips }}</span>
    </div>
  </div>
</template>
