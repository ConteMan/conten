<script setup lang="ts">
import { invokeApi } from '@renderer/utils/ipcMessage'
import { ModuleSettingDefault } from '@renderer/setting'

const data = reactive({
  formRef: null,
  formValue: ModuleSettingDefault,
  formSize: 'small',
})
const { formRef, formValue, formSize } = toRefs(data)

const getConfig = async () => {
  const res = await invokeApi({
    name: 'configs-by-keys',
    data: {
      keys: Object.keys(ModuleSettingDefault),
    },
  })
  // eslint-disable-next-line no-console
  console.log(res)
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
      <div>
        Wakatime
      </div>
      <n-form-item label="API KEY">
        <n-input v-model:value="formValue.wakatime_api_key" placeholder="" />
      </n-form-item>
      <n-divider />

      <div>
        豆瓣
      </div>
      <n-form-item label="ID">
        <n-input v-model:value="formValue.douban_id" placeholder="" />
      </n-form-item>
      <n-divider />

      <div>
        V2EX
      </div>
      <n-form-item label="API KEY">
        <n-input v-model:value="formValue.v2ex_api_key" placeholder="" />
      </n-form-item>
      <n-divider />

      <div>
        TapTap
      </div>
      <n-form-item label="USER ID">
        <n-input v-model:value="formValue.taptap_user_id" placeholder="" />
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
