<script setup lang="ts">
import { invokeApi } from '@renderer/utils/ipcMessage'
import { formValueDefault } from '@main/services/system/type'
import { useSystemState } from '@renderer/store/system'
import { setSystemTheme } from '@renderer/utils'
import { ProxyProtocols } from '@renderer/setting'

const module = 'system'
const message = useMessage()

const customFormDefault = {
  'server.port': '',
  'server.autoStart': false,
}
const customFormKeys = Object.keys(customFormDefault)

const data = reactive({
  formRef: null,
  formValue: formValueDefault,
  formSize: 'small',
  customFormValue: customFormDefault,
  defaultPath: 'defaultPath',
  sqlite3Path: '',
  pathStatusText: '',
  proxy_enable: false,
})
const { formRef, formValue, formSize, customFormValue, defaultPath, pathStatusText, sqlite3Path, proxy_enable } = toRefs(data)

// 测试代理
const testProxy = async () => {
  const res = await invokeApi({
    name: 'test-proxy',
    data: {
      protocol: data.formValue.system_proxy_protocol,
      host: data.formValue.system_proxy_host,
      port: data.formValue.system_proxy_port,
    },
  })
  // eslint-disable-next-line no-console
  console.log('>>> test proxy', res)
  data.proxy_enable = res
}

// 根据模块获取配置数据
const getConfig = async () => {
  const res = await invokeApi({
    name: 'configs',
    data: {
      group_key: module,
    },
  })
  if (res)
    data.formValue = { ...data.formValue, ...res }

  testProxy()
}
getConfig()

// 获取自定义配置
const getCustomConfig = async () => {
  const res = await invokeApi({
    name: 'get-config-stores',
    data: {
      keys: customFormKeys,
    },
  })
  if (res)
    data.customFormValue = res
}
getCustomConfig()

// 保存自定义配置
const setCustomConfig = async () => {
  const res = await invokeApi({
    name: 'set-config-stores',
    data: {
      data: JSON.stringify(data.customFormValue),
    },
  })
  if (res) {
    message.create(res ? 'Custom Success' : 'Custom Error', {
      type: res ? 'success' : 'error',
      duration: 2000,
    })
  }
}

// 设置主题模式
const systemState = useSystemState()
const { themeWithSystem } = storeToRefs(systemState)

// 主题模式修改
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

// 保存设置
const save = async () => {
  await setCustomConfig()

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
  message.create(res ? 'Success' : 'Error', {
    type: res ? 'success' : 'error',
    duration: 2000,
  })
  await testProxy()
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
      <n-divider />

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
      <n-divider />

      <n-form-item label="Koa 服务随应用启动">
        <n-switch v-model:value="customFormValue['server.autoStart']" size="small" :checked-value="true" :unchecked-value="false" />
      </n-form-item>
      <n-form-item label="Koa 服务端口号">
        <n-input v-model:value="customFormValue['server.port']" placeholder="" />
      </n-form-item>
      <n-divider />

      <div class="pb-[8px] flex items-center gap-2">
        <span>
          代理
        </span>
        <mdi-circle class="text-[8px]" :class="[proxy_enable ? 'text-green-400' : 'text-gray-300']" />
        <mdi-access-point class="cursor-pointer" @click="testProxy()" />
      </div>
      <n-form-item :show-label="false">
        <n-select v-model:value="formValue.system_proxy_protocol" :options="ProxyProtocols" placeholder="Protocol" />
      </n-form-item>
      <n-form-item :show-label="false">
        <n-input v-model:value="formValue.system_proxy_host" placeholder="Host" />
      </n-form-item>
      <n-form-item :show-label="false">
        <n-input v-model:value="formValue.system_proxy_port" placeholder="Port" />
      </n-form-item>

      <n-form-item label="Schedule" path="`${module}_schedule`">
        <n-input v-model:value="formValue.system_schedule" placeholder="" />
      </n-form-item>
      <n-form-item label="Schedule Enable" path="`${module}_schedule_enable`">
        <n-switch v-model:value="formValue.system_schedule_enable" size="small" checked-value="1" unchecked-value="0" />
      </n-form-item>
      <n-divider />
    </n-form>

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
