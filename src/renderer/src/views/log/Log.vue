<script setup lang="ts">
import { vInfiniteScroll } from '@vueuse/components'
import { invokeApi } from '@renderer/utils/ipcMessage'

const data = reactive({
  list: [] as any,
  total: 0,
  type: '',
  page: 1,
  pageSize: 100,
  hasMore: true,
})
const { list, total, type, page, pageSize, hasMore } = toRefs(data)

const getList = async () => {
  const res = await invokeApi({
    name: 'log-list',
    data: {
      type: type.value,
      page: page.value,
      pageSize: pageSize.value,
    },
  })
  if (res) {
    // eslint-disable-next-line no-console
    console.log('res', res.rows.length, pageSize.value)
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
</script>

<template>
  <div
    v-infinite-scroll="[loadMore, { distance: 10 }]"
    class="py-2 px-8 flex flex-col gap-2"
  >
    <template v-if="total && list.length">
      <div v-for="item in list" :key="item.id" class="text-xs">
        <div>
          <span
            class="cursor-pointer hover:(underline decoration-2 underline-offset-2)"
          >
            {{ item.desc }}
          </span>
          <span class="mx-[4px]">
            /
          </span>
          <span
            class="cursor-pointer hover:(underline decoration-2 underline-offset-2)"
          >
            {{ item.type }}
          </span>
          <span class="mx-[4px]">
            /
          </span>
          <span>
            {{ item.created_at }}
          </span>
        </div>
      </div>
    </template>
  </div>
</template>
