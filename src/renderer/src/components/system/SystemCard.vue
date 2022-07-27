<script setup lang="ts">
import dayjs from 'dayjs'
import { invokeApi } from '@renderer/utils/ipcMessage'
import { useIntervalFn } from '@vueuse/core'

const data = reactive({
  info: null as any,
})
const { info } = toRefs(data)

const getData = async () => {
  const res = await invokeApi({
    name: 'system-info',
  })

  if (res)
    data.info = res
}

const init = async () => {
  await getData()
}
init()
useIntervalFn(init, 10000)

const convert = (data: number, type = 'KB2MB', format = 4) => {
  switch (type) {
    case 'T2NOW': {
      return ((dayjs().valueOf() - data) / (1000 * 60)).toFixed(format)
    }
    case 'KB2MB':
    default: {
      return (data / 1024).toFixed(format)
    }
  }
}
</script>

<template>
  <div
    v-if="info"
    class="hover-show-parent px-4"
  >
    <div
      class="invisible hover-show cursor-pointer flex items-center mb-4"
      @click="getData()"
    >
      <mdi-refresh />
    </div>
    <div class="flex flex-col gap-2 text-xs">
      <div>
        [ BASE ]
      </div>
      <div>
        Start: {{ dayjs(info.creationTime).format('YYYY-MM-DD HH:mm:ss') }} / {{ convert(info.creationTime, 'T2NOW', 1) }} mins
      </div>
      <div>
        System Version: {{ info.version }}
      </div>
      <div>
        CPU: {{ (info.cpu.percentCPUUsage).toFixed(4) }} %
      </div>
      <div>
        Memory: {{ convert(info.memory.private, 'KB2MB') }} MB (Private) / {{ info.memory.shared > 0 ? convert(info.memory.shared, 'KB2MB') : 0 }} MB (Shared)
      </div>
      <n-hr />
      <div class="font-bold">
        [ METRICS ]
      </div>
      <div
        v-for="item in info.metrics"
        :key="item.pid"
        class="text-xs"
      >
        <div class="font-bold">
          <template v-if="item.serviceName">
            {{ item.serviceName }} /
          </template>{{ item.type }} / {{ item.pid }}
        </div>
        <div>
          CPU: {{ (item.cpu.percentCPUUsage).toFixed(4) }} %
        </div>
        <div>
          Memory: {{ convert(item.memory.workingSetSize, 'KB2MB') }} MB / {{ convert(item.memory.peakWorkingSetSize, 'KB2MB') }} MB
        </div>
      </div>
    </div>
  </div>
</template>
