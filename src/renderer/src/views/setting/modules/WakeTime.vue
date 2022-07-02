<script setup lang="ts">
import { invokeApi } from '@renderer/utils/ipcMessage'
import { formValueDefault } from '@main/services/wakatime/type'

const module = 'wakatime'

const data = reactive({
  formRef: null,
  formValue: formValueDefault,
  formSize: 'small',
})
const { formRef, formValue, formSize } = toRefs(data)

const getConfig = async () => {
  const res = await invokeApi({
    name: 'configs',
    data: {
      group_key: module,
    },
  })
  if (res)
    data.formValue = res
}
getConfig()

const message = useMessage()

const save = async () => {
  const saveData: any = []
  const formValueData = formValue.value as any
  for (const item in formValueData) {
    saveData.push({
      group_key: 'wakatime',
      key: item,
      value: formValueData[item],
    })
  }

  const res = await invokeApi({
    name: 'save-configs',
    data: {
      data: saveData,
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
    <n-form
      :ref="formRef"
      :model="formValue"
      :size="formSize"
    >
      <n-form-item label="Enable" path="wakatime_enable">
        <n-switch v-model:value="formValue.wakatime_enable" size="small" checked-value="1" unchecked-value="0" />
      </n-form-item>
      <n-form-item label="Schedule" path="wakatime_schedule">
        <n-input v-model:value="formValue.wakatime_schedule" placeholder="" />
      </n-form-item>
      <n-form-item label="Schedule Enable" path="wakatime_schedule_enable">
        <n-switch v-model:value="formValue.wakatime_schedule_enable" size="small" checked-value="1" unchecked-value="0" />
      </n-form-item>
      <n-form-item label="API Key" path="wakatime_api_key">
        <n-input v-model:value="formValue.wakatime_api_key" placeholder="" />
      </n-form-item>
    </n-form>
    <n-divider />
    <div class="pb-4">
      <n-button
        size="tiny"
        type="primary"
        @click="save()"
      >
        Save
      </n-button>
    </div>
  </div>
</template>
