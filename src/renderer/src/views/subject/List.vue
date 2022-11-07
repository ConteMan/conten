<script setup lang="ts">
import { vInfiniteScroll } from '@vueuse/components'
import { API } from '@constants/index'
import { ipcApi } from '@renderer/api'

const data = reactive({
  listTypes: [] as string[],
  listStatuses: [],

  list: [] as any,
  total: 0,
  type: 'movie',
  status: 'collect',
  page: 1,
  pageSize: 100,
  hasMore: true,
})
const { listTypes, listStatuses, type, status, list, total, pageSize, hasMore } = toRefs(data)

const getConst = async () => {
  data.listTypes = await ipcApi({ name: API.SUBJECT_TYPES })
  data.listStatuses = await ipcApi({ name: API.SUBJECT_STATUSES })
}
getConst()

const getList = async () => {
  const res = await ipcApi({
    name: 'subjectList',
    args: {
      type: data.type,
      status: data.status,
      page: data.page,
      pageSize: data.pageSize,
    },
  })
  if (res) {
    data.hasMore = !(res.rows.length < pageSize.value)

    data.list = [...data.list, ...res.rows]
    data.total = res.count
  }
}
getList()

const loadMore = async () => {
  // eslint-disable-next-line no-console
  console.log('[ LoadMore ]')
  if (hasMore.value) {
    data.page++
    await getList()
  }
}

const changeType = async (type: string) => {
  data.type = type
  data.page = 1
  data.list = []
  await getList()
}
const changeStatus = async (status: string) => {
  data.status = status
  data.page = 1
  data.list = []
  await getList()
}

const openInDouban = (type: string, id: string | number) => {
  const url = `https://${type}.douban.com/subject/${id}/`
  window.shell.openExternal(url)
}
</script>

<template>
  <div class="flex-grow flex flex-col">
    <div class="flex-shrink-0 flex-grow-0 px-8 pb-6">
      <div class="flex gap-4">
        <span
          v-for="item in listTypes" :key="item"
          :class="{ 'text-red-400 font-bold': item === type }"
          class="cursor-pointer"
          @click="changeType(item)"
        >
          {{ item }}
        </span>
      </div>
      <div class="flex gap-4">
        <span
          v-for="item in listStatuses" :key="item"
          :class="{ 'text-red-400 font-bold': item === status }"
          class="cursor-pointer"
          @click="changeStatus(item)"
        >
          {{ item }}
        </span>
      </div>
    </div>
    <div
      v-infinite-scroll="[loadMore, { distance: 10 }]"
      class="flex-grow py-2 px-8 flex-grow flex flex-col gap-2 overflow-y-scroll"
    >
      <template v-if="total && list.length">
        <div
          v-for="item in list" :key="item.id"
          class="c-list-item text-xs"
        >
          <div>
            <span
              class="cursor-pointer hover:(underline decoration-2 underline-offset-2)"
              @click="openInDouban(data.type, JSON.parse(item.douban_data).id)"
            >
              {{ item.name }}
            </span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style>
.c-list-item:hover .hover-show{
  visibility: visible;
}
</style>
