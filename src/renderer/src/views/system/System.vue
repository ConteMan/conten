<script setup lang="ts">
import { invokeApi } from '@renderer/utils/ipcMessage'

const data = reactive({
  list: [] as any,

})
const { list } = toRefs(data)

const getList = async () => {
  const res = await invokeApi({
    name: 'schedule-list',
  })
  if (res)
    data.list = res
}
getList()
</script>

<template>
  <div class="py-8 px-8 flex flex-col gap-2">
    <template v-if="list.length">
      <div v-for="item in list" :key="item.name" class="text-xs">
        <div>
          <span
            class="cursor-pointer hover:(underline decoration-2 underline-offset-2)"
          >
            {{ item.name }} - {{ item.next }}
          </span>
        </div>
      </div>
    </template>
  </div>
</template>
