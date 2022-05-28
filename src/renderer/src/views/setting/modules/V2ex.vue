<script setup lang="ts">
import { invokeToMain } from '@renderer/utils/ipcMessage'
import { formValueDefault } from '@main/services/v2ex/type'

const module = 'system'

const data = reactive({
  formRef: null,
  formValue: formValueDefault,
  formSize: 'small',
})
const { formRef, formValue, formSize } = toRefs(data)

const getConfig = async () => {
  const res = await invokeToMain('get-configs', {
    group_key: module,
  })
  data.formValue = res
}
getConfig()

const message = useMessage()

const save = async () => {
  const saveData: any = []
  const formValueData = formValue.value as any
  for (const item in formValueData) {
    saveData.push({
      group_key: module,
      key: item,
      value: formValueData[item],
    })
  }

  const res = await invokeToMain('save-configs', JSON.stringify(saveData))
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
      <n-form-item label="Enable" path="v2ex_enable">
        <n-switch v-model:value="formValue.v2ex_enable" size="small" checked-value="1" unchecked-value="0" />
      </n-form-item>
      <n-form-item label="Schedule" path="v2ex_schedule">
        <n-input v-model:value="formValue.v2ex_schedule" placeholder="" />
      </n-form-item>
      <n-form-item label="Schedule Enable" path="v2ex_schedule_enable">
        <n-switch v-model:value="formValue.v2ex_schedule_enable" size="small" checked-value="1" unchecked-value="0" />
      </n-form-item>
      <n-form-item label="API Key" path="v2ex_api_key">
        <n-input v-model:value="formValue.v2ex_api_key" placeholder="" />
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
