<script setup lang="ts">
import _ from 'lodash'
import { vInfiniteScroll } from '@vueuse/components'
import { invokeApi, openInBrowser } from '@renderer/utils'
import { InfoPlatform } from '@renderer/setting'

const data = reactive({
  list: [] as any,
  total: 0,
  type: [] as string[],
  page: 1,
  pageSize: 100,
  hasMore: true,
})
const { list, total, page, pageSize, hasMore } = toRefs(data)

const dealList = computed(() => {
  return data.list.filter((item: any) => {
    if (item.platform === 'football') {
      if (item.data.status)
        return false
    }
    return true
  })
})

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

const changeType = async (type: string) => {
  if (!type)
    data.type = []
  else
    data.type = [type]

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
  <div class="flex">
    <div class="w-[120px] pr-4 pb-[160px] flex-grow-0 flex-shrink-0 flex flex-col justify-end gap-2">
      <div
        v-for="typeItem in InfoPlatform" :key="typeItem.value"
        class="pl-4 text-[12px] h-[28px] flex flex-col justify-center cursor-pointer hover:(underline decoration-2 underline-offset-4)"
        :class="{ 'font-bold text-red-600 bg-blue-300 text-white !no-underline': data.type.includes(typeItem.value) || (!data.type.length && !typeItem.value) }"
        @click.stop="changeType(typeItem.value)"
      >
        {{ typeItem.name }}
      </div>
    </div>
    <div
      v-infinite-scroll="[loadMore, { distance: 10 }]"
      class="hover-scroll px-8 flex-grow flex flex-col overflow-y-scroll"
    >
      <template v-if="total && list.length">
        <div v-for="item in dealList" :key="item.id" class="hover-show-parent py-1">
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
            <template v-if="item.platform === 'libvio'">
              <span
                class="cursor-pointer hover:(underline decoration-2 underline-offset-2)"
                @click="openInBrowser(`https://www.libvio.me/detail/${item.data.id}.html`)"
              >
                《{{ item.data.title }}》
              </span>
              <template v-if="item.data.douban">
                <span class="invisible hover-show mx-[4px]">
                  /
                </span>
                <span
                  class="invisible hover-show cursor-pointer hover:(underline decoration-2 underline-offset-2)"
                  @click="openInBrowser(`https://movie.douban.com/subject/${item.data.douban.id}`)"
                >
                  豆瓣
                </span>
              </template>
              <span class="invisible hover-show mx-[4px]">
                /
              </span>
              <span
                class="invisible hover-show cursor-pointer hover:(underline decoration-2 underline-offset-2)"
                @click="openInBrowser('https://www.libvio.me')"
              >
                Libvio
              </span>
            </template>
            <template v-if="item.platform === 'ddrk'">
              <span
                class="cursor-pointer hover:(underline decoration-2 underline-offset-2)"
                @click="openInBrowser(`https://www.ddrk.me/${item.data.id}/`)"
              >
                《{{ item.data.title }}》
              </span>
              <span class="invisible hover-show mx-[4px]">
                /
              </span>
              <span
                class="invisible hover-show cursor-pointer hover:(underline decoration-2 underline-offset-2)"
                @click="openInBrowser('https://www.ddrk.me')"
              >
                低端影视
              </span>
            </template>
            <template v-if="item.platform === 'football'">
              <span
                class="cursor-pointer hover:(underline decoration-2 underline-offset-2)"
                @click="openInBrowser(item.data.home_team_url)"
              >
                {{ item.data.home_team }}
              </span>
              <span class="mx-[4px]">
                VS
              </span>
              <span
                class="cursor-pointer hover:(underline decoration-2 underline-offset-2)"
                @click="openInBrowser(item.data.visiting_team_url)"
              >
                {{ item.data.visiting_team }}
              </span>
              <span class="mx-[4px]">
                /
              </span>
              <span>
                {{ item.data.time }}
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
