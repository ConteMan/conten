<script setup lang="ts">
import { invokeApi } from '@renderer/utils/ipcMessage'
import { formValueDefault } from '@main/services/system/type'
import { useSystemState } from '@renderer/store/system'
import { setSystemTheme } from '@renderer/utils'

const module = 'system'

const data = reactive({
  formRef: null,
  formValue: formValueDefault as any,
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
  data.formValue = res
}
getConfig()
const systemState = useSystemState()
const { themeWithSystem } = storeToRefs(systemState)
// eslint-disable-next-line no-console
console.log(themeWithSystem.value)
const themeWithSystemChange = async (value: boolean) => {
  // eslint-disable-next-line no-console
  console.log('>>> themeWithSystem change:', value)

  if (value)
    setSystemTheme()

  await invokeApi({
    name: 'set-config-store',
    data: {
      key: 'themeWithSystem',
      value,
    },
  })
}

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
      <n-form-item label="深色模式跟随系统">
        <n-switch v-model:value="themeWithSystem" size="small" @update:value="themeWithSystemChange" />
      </n-form-item>
      <n-form-item label="Schedule" path="`${module}_schedule`">
        <n-input v-model:value="formValue[`${module}_schedule`]" placeholder="" />
      </n-form-item>
      <n-form-item label="Schedule Enable" path="`${module}_schedule_enable`">
        <n-switch v-model:value="formValue[`${module}_schedule_enable`]" size="small" checked-value="1" unchecked-value="0" />
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
