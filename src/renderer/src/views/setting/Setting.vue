<template>
  <div>
    <div class="text-[14px]">
      <span class="text-gray-400">[</span>
      数据库
      <span class="text-gray-400">]</span>
    </div>
    <hr class="mt-4 mb-2"/>

    <n-dynamic-input
      v-model:value="database"
      :on-create="onCreate"
      :min="1"
      :max="3"
      show-sort-button
    >
      <template #default="{ value, index }">
        <div class="flex items-center w-full">
          <div class="w-[140px]" :class="{ 'text-red-400': index === 0}">MongoDB {{ `[ ${index + 1} ]` }} : </div>
          <n-input class="" v-model:value="value.url" type="text" />
        </div>
      </template>
    </n-dynamic-input>
  </div>

  <div class="mt-8">
    <n-button
      class=""
      size="small"
      type="primary"
      @click="onSave"> Save </n-button>
  </div>

  <pre class="mt-10" v-html="JSON.stringify(database, null, 2)" />
</template>

<script setup lang="ts">
import { onBeforeRouteUpdate } from 'vue-router';
import { invokeToMain } from '@renderer/utils/ipcMessage'

interface dbItem {
  url: string
  selected: boolean
}

const data = reactive({
  database: [{
    selected: true,
    url: '',
  }] as dbItem[],
}) 
const { database } = toRefs(data)

const getSetting = async() => {
  const res = await invokeToMain('get-settings')
  console.log(res)
  data.database = res.db.mongodb
}
getSetting()

const onCreate = () => {
  return {
    isSelected: false,
    url: '',
  }
}

watch(database, () => {
  database.value.map((item, index) => {
    item.selected = index === 0
  })
})

const onSave = async() => {
  const saveSetting = {
    mongodb: toRaw(data.database),
  }
  await invokeToMain('save-settings', JSON.stringify(saveSetting))
}
</script>
