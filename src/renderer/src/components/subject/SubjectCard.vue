<script setup lang="ts">
import { invokeApi } from '@renderer/utils/ipcMessage'

const module = 'subject'
const data = reactive({
  enable: false,
  list: null as any,
})
const { list } = toRefs(data)

const getData = async (refresh = false) => {
  const res = await invokeApi({
    name: module,
    data: {
      method: 'list',
      params: {
        type: 'movie',
        status: 'do',
        page: 1,
        pageSize: 20,
      },
    },
  })
  data.list = res ?? null
}

const init = async () => {
  await getData()
}
init()

const openInBrowser = (url: string) => {
  window.shell.openExternal(url)
}
</script>

<template>
  <div v-if="list" class="p-2">
    <div>
      <span class="pb-1">[ 在看 / 影视 ]</span>
    </div>
    <div class="flex flex-row flex-wrap gap-2 mt-2">
      <div v-for="item in list.rows" :key="item.id" class="p-2 border">
        <div
          class="cursor-pointer hover:(underline decoration-2 underline-offset-2)"
          @click="openInBrowser(`https://movie.douban.com/subject/${JSON.parse(item.douban_data).id}`)"
        >
          {{ item.name }}
        </div>
      </div>
    </div>
  </div>
</template>
