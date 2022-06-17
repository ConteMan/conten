<script setup lang="ts">
import _ from 'lodash'
import { invokeApi, invokeToMain } from '@renderer/utils/ipcMessage'
import { configDefault } from '@main/services/shortcut/model'

const module = 'shortcut'
const keyTipDefault = '请按下要设置的快捷键 ...'

const data = reactive({
  formRef: null,
  formValue: configDefault,
  formSize: 'small',

  showKeyModal: false, // 是否显示快捷键设置模态框
  current: '', // 当前设置项
  des: '', // 当前设置项描述
  keys: [] as string[], // 快捷键数组
  keyTip: keyTipDefault, // 快捷键设置提示
  keyRecordState: 1, // 0 不记录， 1 可以记录
  keyEnable: false, // 快捷键是否可用，可用时才可以保存
})
const { formValue, keys, keyTip, showKeyModal, keyEnable, des } = toRefs(data)

const getConfig = async () => {
  const res = await invokeToMain('get-configs', {
    group_key: module,
  })
  if (Object.keys(res).length)
    data.formValue = res
}
getConfig()

const message = useMessage()

// 修饰键
const magicKeys = ['Control', 'Shift', 'Alt', 'Meta']

// 校验快捷键是否可以注册
const checkShortcutEnable = async (name: string, shortcut: string) => {
  const res = await invokeApi({
    name: 'check-shortcut',
    data: {
      name,
      shortcut,
    },
  })
  if (res === 2) {
    data.keyEnable = true
    data.keyTip = '此快捷键可以注册!'
  }
  else {
    data.keyTip = '此快捷键已被注册!'
  }
}

// 按下按键
const onKeyDown = async (event: KeyboardEvent) => {
  // eslint-disable-next-line no-console
  console.log(event.code)

  if (!data.keyRecordState)
    return

  if (data.keys.length < 3 && magicKeys.includes(event.key)) { // TODO: 组合键目前不支持三个以上修饰键
    const dealShortcut = event.key.toUpperCase() // 兼容处理
      .replaceAll('CONTROL', 'CommandOrControl')
      .replaceAll('SHIFT', 'Shift')
      .replaceAll('META', 'Meta')
      .replaceAll('ALT', 'Alt')
      .replaceAll('META', 'Meta')
    data.keys.push(dealShortcut)
    return
  }
  if (data.keys.length > 0 && !magicKeys.includes(event.key)) { // 非修饰键结尾，则判定为一组快捷键完毕
    if (/Key/.test(event.code)) // 组合键时，code 更符合规则，key 可能获取到特殊字符
      data.keys.push(event.code.replace('Key', ''))
    else
      data.keys.push(event.key.toUpperCase())

    data.keyRecordState = 0

    data.keyTip = 'Check ...'
    await checkShortcutEnable(data.current, _.join(data.keys, '+'))
  }
}

// 松开按键
const onKeyUp = (event: KeyboardEvent) => {
  // eslint-disable-next-line no-console
  console.log(event.code)

  if (!data.keyRecordState)
    return

  data.keys = _.remove(data.keys, (item: string) => item === event.key)

  if (data.keys.length === 0)
    data.keyRecordState = 1
}

// 打开按键设置模态框
const keyModal = (name: string, des: string) => {
  data.showKeyModal = true
  data.current = name
  data.des = des
  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('keyup', onKeyUp)
}

// 关闭按键设置模态框
const cancelKeyModal = () => {
  data.showKeyModal = false
  data.current = ''
  data.des = ''
  data.keys = []
  data.keyTip = keyTipDefault
  data.keyRecordState = 1
  data.keyEnable = false
  document.removeEventListener('keydown', onKeyDown)
  document.removeEventListener('keyup', onKeyUp)
}

// 按键设置模态框中的重置按键
const resetKey = () => {
  data.keys = []
  data.keyTip = keyTipDefault
  data.keyRecordState = 1
  data.keyEnable = false
}

// 意外退出时取消按键监听
onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown)
  document.removeEventListener('keyup', onKeyUp)
})

// 保存快捷键设置
const saveShortcut = async () => {
  const res = await invokeApi({
    name: 'save-shortcut',
    data: {
      name: data.current,
      shortcut: _.join(data.keys, '+'),
    },
  })
  if (res) {
    cancelKeyModal()
    getConfig()
  }

  message.create(`${res}` ? 'Success' : 'Error', {
    type: res ? 'success' : 'error',
    duration: 2000,
  })
}
</script>

<template>
  <div class="w-full">
    <div>
      <div class="mb-2">
        显示/隐藏应用
      </div>
      <div
        class="content-container py-2 w-full flex items-center"
      >
        {{ formValue.shortcut_show_app }}
        <div class="action-btn flex items-center ml-8 gap-2">
          <mdi-square-edit-outline class="cursor-pointer" @click="keyModal('shortcut_show_app', '显示/隐藏应用')" />
        </div>
      </div>
    </div>

    <!-- 按键监听窗口 -->
    <div
      v-if="showKeyModal"
      class="bg z-999 fixed top-0 left-0 w-full h-full gap-4 flex flex-col justify-center items-center"
    >
      <div class="text-xl bold mb-4">
        {{ des }}
      </div>
      <div class="w-[30%] h-10 bg-gray-400 rounded-md flex justify-end items-center p-2">
        <div class="flex-grow-1 w-full flex justify-start">
          {{ _.join(keys, ' + ') }}
        </div>
        <div class="flex-grow-0 w-4 flex items-center">
          <mdi-refresh class="cursor-pointer" @click="resetKey()" />
        </div>
      </div>
      <div class="text-sm">
        {{ keyTip }}
      </div>
      <div class="flex gap-2">
        <n-button size="small" @click="cancelKeyModal()">
          取消
        </n-button>
        <n-button size="small" :disabled="!keyEnable" @click="saveShortcut()">
          确定
        </n-button>
      </div>
    </div>
  </div>
</template>

<style>

</style>
