<script setup lang="ts">
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

const init = async () => {
  const res = await invokeApi({
    name: 'schedule-setting-init',
  })
  if (res)
    await getList()
}

const message = useMessage()

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
            <span class="hover-show invisible text-gray-400">{{ item.key }}</span>
          </div>
          <div>
            <n-input
              v-model:value="item.crontab"
              size="small"
              placeholder="crontab like * * * * *"
              @blur="change(index)"
            />
          </div>
          <div>
            <n-switch
              v-model:value="item.enable"
              size="small"
              :checked-value="1"
              :unchecked-value="0"
              @change="change(index)"
            />
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
