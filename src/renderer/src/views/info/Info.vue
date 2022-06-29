<script setup lang="ts">
import { vInfiniteScroll } from '@vueuse/components'
import { invokeApi } from '@renderer/utils/ipcMessage'
import { InfoPlatform } from '@renderer/setting'
import _ from 'lodash'

const data = reactive({
  list: [] as any,
  total: 0,
  type: [] as string[],
  page: 1,
  pageSize: 100,
  hasMore: true,
})
const { list, total, page, pageSize, hasMore } = toRefs(data)

const getList = async () => {
  const res = await invokeApi({
    name: 'info-list',
    data: {
      type: data.type.join(','),
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

const openInBrowser = (url: string) => {
  window.shell.openExternal(url)
}

const changeType = async (type: string) => {
  if (data.type.includes(type))
    _.remove(data.type, item => item === type)
  else
    data.type.push(type)

  data.page = 1
  data.list = []
  await getList()
}

const deleteItem = async (id: number) => {
  const res = await invokeApi({
    name: 'info-action',
    data: {
      action: 'delete',
      id,
    },
  })
  if (res) {
    _.remove(data.list, (item: any) => {
      return item.id === id
    })
  }
}
</script>

<template>
  <div class="flex flex-col">
    <div class="px-8 pb-2 flex-grow-0 flex items-center gap-2">
      <n-tag
        v-for="typeItem in InfoPlatform" :key="typeItem.value"
        class="font-bold"
        :checked="data.type.includes(typeItem.value)"
        size="small"
        checkable
        @click.stop="changeType(typeItem.value)"
      >
        {{ typeItem.name }}
      </n-tag>
    </div>
    <div
      v-infinite-scroll="[loadMore, { distance: 10 }]"
      class="px-8 flex-grow flex flex-col overflow-y-scroll"
    >
      <template v-if="total && list.length">
        <div v-for="item in list" :key="item.id" class="hover-show-parent py-1">
          <div class="flex items-center">
            <template v-if="item.platform === 'v2ex'">
              <span
                class="cursor-pointer hover:(underline decoration-2 underline-offset-2)"
                @click="openInBrowser(`https://www.v2ex.com${item.data.title_link}`)"
              >
                {{ item.data.title }}
              </span>
              <span class="invisible hover-show mx-[4px]">
                /
              </span>
              <span
                class="invisible hover-show cursor-pointer hover:(underline decoration-2 underline-offset-2)"
                @click="openInBrowser('https://www.v2ex.com')"
              >
                V2EX
              </span>
            </template>
            <template v-if="item.platform === 'sspai'">
              <span
                class="cursor-pointer hover:(underline decoration-2 underline-offset-2)"
                @click="openInBrowser(`https://sspai.com/post/${item.data.ca_data_id}`)"
              >
                <template v-if="item.platform_type === 'sspai-followActivity'">
                  {{ item.data.data.title }}
                </template>
                <template v-else>
                  {{ item.data.title }}
                </template>
              </span>
              <span class="invisible hover-show mx-[4px]">
                /
              </span>
              <span
                class="invisible hover-show cursor-pointer hover:(underline decoration-2 underline-offset-2)"
                @click="openInBrowser('https://www.sspai.com')"
              >
                少数派
              </span>
            </template>
            <span class="invisible hover-show mx-[4px]">
              /
            </span>
            <span class="invisible hover-show cursor-pointer inline-flex items-center" @click="deleteItem(item.id)">
              <mdi-delete />
            </span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
