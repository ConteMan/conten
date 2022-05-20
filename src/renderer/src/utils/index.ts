import { usePreferredDark } from '@vueuse/core'
import { useSystemState } from '@renderer/store/system'

export function is(val: unknown, type: string) {
  return toString.call(val) === `[object ${type}]`
}

export function isObject(val: any): val is Record<any, any> {
  return val !== null && is(val, 'Object')
}

/**
 * 设置应用主题颜色为系统主题颜色
 */
export function setSystemTheme() {
  const isDark = usePreferredDark()
  const systemState = useSystemState()
  if (isDark.value)
    systemState.toggleDark(true)
  else
    systemState.toggleDark(false)
}
