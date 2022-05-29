<script setup lang="ts">
import { invokeApi } from '@renderer/utils/ipcMessage'
import { useRefreshState } from '@renderer/store/refresh'

const data = reactive({
  list: [] as any,
  total: 0,
  type: 'v2ex',
  page: 1,
  pageSize: 20,
})
const { list, total, type, page, pageSize } = toRefs(data)

const getList = async () => {
  const res = await invokeApi({
    name: 'info-list',
    data: {
      type: type.value,
      page: page.value,
      pageSize: pageSize.value,
    },
  })
  if (res) {
    data.list = res.rows
    data.total = res.count
  }
}
getList()

const openInBrowser = (url: string) => {
  window.shell.openExternal(url)
}

const refreshState = useRefreshState()
watch(() => refreshState.v2ex, (val) => {
  if (val) {
    getList()
    refreshState.toggle('v2ex', false)
  }
})
</script>

<template>
  <div class="py-8 px-8 flex flex-col gap-2">
    <template v-if="total && list.length">
      <div v-for="item in list" :key="item.id" class="text-xs">
        <template v-if="item.platform === 'v2ex'">
          <div>
            <span
              class="cursor-pointer hover:(underline decoration-2 underline-offset-2)"
              @click="openInBrowser(`https://www.v2ex.com${item.data.title_link}`)"
            >
              {{ item.data.title }}
            </span>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>
