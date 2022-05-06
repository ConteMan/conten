<template>
  <div class="p-4 pt-8">    
    <div class="group">
      <div class="text-[14px] mb-2">
        <span class="text-gray-400">[</span>
        数据库
        <span class="text-gray-400">]</span>
      </div>
      <n-collapse arrow-placement="right">
        <n-collapse-item title="MongoDB" name="1">
          <VueJsonPretty v-if="mongodb" :data="mongodb" />
        </n-collapse-item>
      </n-collapse>
    </div>
    <hr class="bg-light-400 mt-4 mb-4" >
    <div class="group">
      <div class="text-[14px] mb-2">
        <span class="text-gray-400">[</span>
        Electron
        <span class="text-gray-400">]</span>
      </div>
      <n-collapse arrow-placement="right">
        <n-collapse-item title="MongoDB" name="1">
          <pre v-html="JSON.stringify(mongodb, null, 2)" />
        </n-collapse-item>
      </n-collapse>
    </div>
  </div>
</template>
<script setup lang="ts">
import { invokeToMain } from '@renderer/utils/ipcMessage'
import VueJsonPretty from 'vue-json-pretty';

const route = useRoute()

interface Data {
  mongodb: any | null
}
const data = reactive<Data>({
  mongodb: null
})
const { mongodb } = toRefs(data)

const getStatus = async () => {
  const statusRes = await invokeToMain('get-status')
  data.mongodb = statusRes.mongodb
  console.log(statusRes)
}

getStatus()
</script>
