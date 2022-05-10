<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { invokeToMain } from '@renderer/utils/ipcMessage'

const data = reactive({
  formRef: null,
  formValue: {
    wakatime_api_key: '',
  },
  formSize: 'small',
})
const { formRef, formValue, formSize } = toRefs(data)

const getConfig = async () => {
  const res = await invokeToMain('get-configs', {
    group_key: 'wakatime',
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
      group_key: 'wakatime',
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
      <n-form-item label="API Key" path="wakatime_api_key">
        <n-input v-model:value="formValue.wakatime_api_key" placeholder="" />
      </n-form-item>
    </n-form>
    <div class="fixed bottom-0 py-4">
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
