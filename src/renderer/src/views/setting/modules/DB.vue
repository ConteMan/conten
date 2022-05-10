<script setup lang="ts">
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

const getSetting = async () => {
  const res = await invokeToMain('get-settings')
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
    return item
  })
})

const onSave = async () => {
  const saveSetting = {
    mongodb: toRaw(data.database),
  }
  await invokeToMain('save-settings', JSON.stringify(saveSetting))
}
</script>

<template>
  <div>
    <div class="text-[14px] mb-4">
      <span class="text-gray-400">[</span>
      MongoDB
      <span class="text-gray-400">]</span>
    </div>

    <n-dynamic-input
      v-model:value="database"
      :on-create="onCreate"
      :min="1"
      :max="3"
      show-sort-button
    >
      <template #default="{ value, index }">
        <div class="flex items-center w-full">
          <div class="w-[48px]" :class="{ 'text-red-400': index === 0 }">
            {{ `[ ${index + 1} ]` }}
          </div>
          <n-input v-model:value="value.url" size="small" type="text" />
        </div>
      </template>
    </n-dynamic-input>
  </div>

  <div class="fixed bottom-0 py-4">
    <n-button
      class=""
      size="tiny"
      type="primary"
      @click="onSave"
    >
      Save
    </n-button>
  </div>
</template>
