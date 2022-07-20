<script setup lang="ts">
import { invokeApi, openInBrowser } from '@renderer/utils'

const data = reactive({
  loading: true,
  list: [],
  currentIndex: 0,
  current: {} as any,
  cardStyle: {} as any,
})

const refresh = (init = true) => {
  let index = 0
  if (init)
    index = 0
  else
    index = data.currentIndex + 1 > data.list.length - 1 ? 0 : data.currentIndex + 1

  data.currentIndex = index
  data.current = data.list[index]
  data.cardStyle = {
    'background-image': data.current.pic ? `-webkit-cross-fade(url(data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==), url(${data.current.pic}), 20%)` : '',
  }
}

const getData = async () => {
  const res = await invokeApi({
    name: 'kv',
    data: {
      key: 'extension_one',
    },
  })
  if (res) {
    data.list = res.data
    refresh()
  }
  data.loading = false
}
getData()

const { current } = toRefs(data)
</script>

<template>
  <div class="p-4 flex flex-col justify-between bg-center bg-cover transition-opacity" :style="data.cardStyle">
    <div class="flex flex-col justify-center">
      <div class="cursor-default" v-html="current.text" />
      <div class="pt-1">
        《
        <a class="cursor-pointer hover:(underline underline-offset-2 duration-200 animate-pulse)" @click="openInBrowser(current.articleLink)">
          {{ current.articleTitle }}
        </a>
        》
        <span v-if="current.articleAuthor"> {{ current.articleAuthor }}</span>
      </div>
      <div class="pt-1">
        <a class="cursor-pointer hover:(underline underline-offset-2 duration-200 animate-pulse)" @click="openInBrowser(current.questionLink)">
          {{ current.questionTitle }}
        </a>
      </div>
      <div class="pt-4 flex justify-between">
        <div class="cursor-pointer inline-block hover:(animate-pulse)" @click="refresh(false)">
          {{ current.vol }}
        </div>
      </div>
    </div>
  </div>
</template>
