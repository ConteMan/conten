<script setup lang="ts">
import dayjs from 'dayjs'
import { vInfiniteScroll } from '@vueuse/components'
import { invokeApi } from '@renderer/utils/ipcMessage'
import { SubjectStatus, SubjectType } from '@renderer/setting'

const data = reactive({
  list: [] as any,
  total: 0,
  type: 'movie',
  status: 'do',
  page: 1,
  pageSize: 100,
  hasMore: true,
})
const { list, total, pageSize, hasMore } = toRefs(data)

const getList = async () => {
  const res = await invokeApi({
    name: 'subject-list',
    data: {
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
  if (hasMore.value) {
    data.page++
    await getList()
  }
}

const openInDouban = (type: string, id: string | number) => {
  const url = `https://${type}.douban.com/subject/${id}/`
  window.shell.openExternal(url)
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
</script>

<template>
  <div class="flex flex-col">
    <div class="px-8 pb-2 flex-grow-0 flex items-center">
      <div class="type-tag flex gap-2">
        <n-tag
          v-for="typeItem in SubjectType" :key="typeItem.value"
          :checked="data.type === typeItem.value"
          size="small"
          checkable
          @click.stop="changeType(typeItem.value)"
        >
          {{ typeItem.name }}
        </n-tag>
      </div>
      <span class="mx-2 h-[10px] border border-r-light-400" />
      <div class="status-tag flex gap-2">
        <n-tag
          v-for="statusItem in SubjectStatus" :key="statusItem.value"
          :checked="data.status === statusItem.value"
          size="small"
          checkable
          @click.stop="changeStatus(statusItem.value)"
        >
          {{ statusItem.name }}
        </n-tag>
      </div>
      <!-- <span class="mx-2 h-[10px] border border-r-light-400" />
      <div class="flex items-center" title="同步">
        <mdi-sync class="ml-1 text-light-800 cursor-pointer hover:(text-black)" />
      </div> -->
    </div>
    <div
      v-infinite-scroll="[loadMore, { distance: 10 }]"
      class="py-2 px-8 flex-grow flex flex-col gap-2 overflow-y-scroll"
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
            <span class="hover-show text-gray-400 ml-2 invisible">
              {{ dayjs(item.info_at).format('YYYY-MM-DD') }}
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
