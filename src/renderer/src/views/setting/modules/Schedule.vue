<script setup lang="ts">
import dayjs from 'dayjs'
import { invokeApi } from '@renderer/utils/ipcMessage'
import type { ScheduleModel } from '@main/services/schedule/type'

const module = 'schedule'

const data = reactive({
  list: [] as ScheduleModel[],
})
const { list } = toRefs(data)

const getList = async () => {
  const res = await invokeApi({
    name: 'schedule-setting-list',
  })
  if (res)
    data.list = res
}
getList()

const message = useMessage()

const init = async () => {
  const res = await invokeApi({
    name: 'schedule-setting-init',
  })
  if (res)
    await getList()
  message.create(`${res}` ? 'Success' : 'Error', {
    type: res ? 'success' : 'error',
    duration: 2000,
  })
}

const change = async (index: number) => {
  // eslint-disable-next-line no-console
  console.log(index, list.value[index])

  const { id, crontab, enable } = list.value[index]

  const res = await invokeApi({
    name: 'schedule-setting-save',
    data: {
      id,
      data: {
        crontab,
        enable,
      },
    },
  })
  if (res)
    getList()
  message.create(`${res}` ? 'Success' : 'Error', {
    type: res ? 'success' : 'error',
    duration: 2000,
  })
}
</script>

<template>
  <div>
    <div>
      <template v-for="(item, index) in list" :key="item.id">
        <div class="hover-show-parent mb-8 flex flex-col gap-2">
          <div>
            {{ item.name }}
            <span class="hover-show invisible text-gray-400 ml-2">{{ item.key }}</span>
          </div>
          <div>
            <n-input
              v-model:value="item.crontab"
              size="small"
              placeholder="crontab like * * * * *"
              @blur="change(index)"
            />
          </div>
          <div class="flex items-center gap-2">
            <n-switch
              v-model:value="item.enable"
              size="small"
              :checked-value="1"
              :unchecked-value="0"
              @update:value="change(index)"
            />
            <div v-if="item.last_at" class="hover-show invisible text-gray-400">
              LAST: {{ dayjs(item.last_at).format('DD HH:mm:ss') }}
            </div>
            <div v-if="item.next_at" class="hover-show invisible text-gray-400">
              NEXT: {{ dayjs(item.next_at).format('DD HH:mm:ss') }}
            </div>
          </div>
        </div>
      </template>
    </div>

    <n-divider />

    <div class="pb-4">
      <n-button
        size="tiny"
        type="primary"
        @click="init()"
      >
        初始化
      </n-button>
    </div>
  </div>
</template>
