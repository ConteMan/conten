<script setup lang="ts">
import { invokeApi } from '@renderer/utils/ipcMessage'
import { formValueDefault } from '@main/services/system/type'
import { useSystemState } from '@renderer/store/system'
import { setSystemTheme } from '@renderer/utils'

const module = 'system'
const message = useMessage()

const data = reactive({
  formRef: null,
  formValue: formValueDefault as any,
  formSize: 'small',
  defaultPath: 'defaultPath',
  pathStatusText: '',
  sqlite3Path: '',
})
const { formRef, formValue, formSize, defaultPath, pathStatusText, sqlite3Path } = toRefs(data)

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

// 设置主题模式
const systemState = useSystemState()
const { themeWithSystem } = storeToRefs(systemState)

const themeWithSystemChange = async (value: boolean) => {
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

// 获取配置文件路径
const getDefaultPath = async () => {
  const res = await invokeApi({
    name: 'get-store-path',
    data: {
      name: 'default',
    },
  })
  data.defaultPath = res
}
getDefaultPath()

// 获取 SQLite3 数据文件路径
const getSQLite3Path = async () => {
  const res = await invokeApi({
    name: 'get-sqlite3-path',
  })
  data.sqlite3Path = res
}
getSQLite3Path()

// 打开对话框选择配置文件目录
const getPathByDialog = async (type = 'config', name = 'default') => {
  const res = await invokeApi({
    name: 'select-path-dialog',
    data: {
      type,
      name,
    },
  })
  if (type === 'config')
    data.defaultPath = res.path
  if (type === 'sqlite3')
    data.sqlite3Path = res.path

  if (res?.change && type === 'config')
    data.pathStatusText = '配置已更新, 请重启'

  message.create(res ? 'Success' : 'Error', {
    type: res ? 'success' : 'error',
    duration: 2000,
  })
}

// 重置配置文件目录
const resetStorePath = async (type = 'config', name = 'default') => {
  const res = await invokeApi({
    name: 'reset-store-path',
    data: {
      type,
      name,
    },
  })
  if (type === 'config')
    data.defaultPath = res.path
  if (type === 'sqlite3')
    data.sqlite3Path = res.path
  if (res?.change && type === 'config')
    data.pathStatusText = '配置已更新, 请重启'
}

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
      <n-form-item label="配置文件路径">
        <div class="flex items-center">
          <div class="self">
            {{ defaultPath }}
          </div>
          <div class="cursor-pointer ml-2 flex" title="选择路径" @click="getPathByDialog()">
            <mdi-cursor-default-click />
          </div>
          <div class="cursor-pointer ml-2 flex" title="重置为默认路径" @click="resetStorePath()">
            <mdi-restore />
          </div>
          <span v-if="pathStatusText" class="ml-2 text-xs text-red-400">{{ pathStatusText }}</span>
        </div>
      </n-form-item>
      <n-form-item label="SQLite3 数据文件路径">
        <div class="flex items-center">
          <div class="self">
            {{ sqlite3Path }}
          </div>
          <div class="cursor-pointer ml-2 flex" title="选择路径" @click="getPathByDialog('sqlite3')">
            <mdi-cursor-default-click />
          </div>
          <div class="cursor-pointer ml-2 flex" title="重置为默认路径" @click="resetStorePath('sqlite3')">
            <mdi-restore />
          </div>
          <span v-if="pathStatusText" class="ml-2 text-xs text-red-400">{{ pathStatusText }}</span>
        </div>
      </n-form-item>
      <n-form-item label="Schedule" path="`${module}_schedule`">
        <n-input v-model:value="formValue[`${module}_schedule`]" placeholder="" />
      </n-form-item>
      <n-form-item label="Schedule Enable" path="`${module}_schedule_enable`">
        <n-switch v-model:value="formValue[`${module}_schedule_enable`]" size="small" checked-value="1" unchecked-value="0" />
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
