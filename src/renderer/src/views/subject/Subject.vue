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
  pageSize: 50,
  hasMore: true,

  listSign: true,
})
const { listTypes, listStatuses, type, status, list, total, pageSize, hasMore, listSign } = toRefs(data)

const getConst = async () => {
  data.listTypes = await ipcApi({ name: API.SUBJECT_TYPES })
  data.listStatuses = await ipcApi({ name: API.SUBJECT_STATUSES })
}
getConst()

const getList = async (append = true) => {
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
    if (append) {
      data.list = [...data.list, ...res.rows]
    }
    else {
      data.listSign = !data.listSign
      if (data.list.length > data.pageSize)
        data.list = []
      data.list = res.rows
    }
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
  await getList(false)
}
const changeStatus = async (status: string) => {
  data.status = status
  data.page = 1
  await getList(false)
}

const openInDouban = (type: string, id: string | number) => {
  const url = `https://${type}.douban.com/subject/${id}/`
  window.shell.openExternal(url)
}
</script>

<template>
  <div>
    <div class="pb-2 px-8">
      <div class="flex gap-4">
        <span
          v-for="item in listTypes" :key="item"
          :class="{ 'text-red-400 font-bold': item === type }"
          class="cursor-pointer uppercase"
          @click="changeType(item)"
        >
          {{ item }}
        </span>
      </div>
      <div class="flex gap-4">
        <span
          v-for="item in listStatuses" :key="item"
          :class="{ 'text-red-400 font-bold': item === status }"
          class="cursor-pointer uppercase"
          @click="changeStatus(item)"
        >
          {{ item }}
        </span>
      </div>
    </div>
    <div
      v-infinite-scroll="[loadMore, { distance: 10 }]"
      class="py-2 px-8 flex flex-col gap-2 overflow-auto"
    >
      <template v-if="total && list.length">
        <template v-if="listSign">
          <TransitionGroup name="list" appear>
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
          </TransitionGroup>
        </template>
        <template v-else>
          <TransitionGroup name="list" appear>
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
          </TransitionGroup>
        </template>
      </template>
    </div>
  </div>
</template>

<style>
.c-list-item:hover .hover-show{
  visibility: visible;
}
.list-enter-active {
  transition: opacity 0.8s linear;
}
.list-enter-from,
.list-leave-to,
.list-leave-from {
  opacity: 0;
}
</style>
