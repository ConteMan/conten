import { globalShortcut } from 'electron'
import type { ShortcutConfig } from '@main/services/shortcut/model'
import { getConfigsByGroup } from '@main/services/config'
import { configDefault } from '@main/services/shortcut/model'

/**
 * 显示/隐藏应用
 */
function showApp() {
  if (global.win?.isVisible()) {
    if (!global.win?.isFocused())
      global.win?.show()
    else
      global.win?.hide()
  }
  else {
    global.win?.show()
  }
}

/**
 * 快捷键名称和方法映射
 */
const shortcutsMethods: Record<string, any> = {
  shortcut_show_app: showApp,
}

/**
 * 初始化快捷键
 */
export async function shortcutsInit() {
  try {
    let count = 0

    const shortcuts: ShortcutConfig = configDefault
    const shortcutNames = Object.keys(configDefault)
    const configs = await getConfigsByGroup('shortcut')

    for (const name of shortcutNames) {
      if (!shortcutsMethods[name])
        continue
      if (configs) {
        if (configs[name] && configs[name].value)
          shortcuts[name] = configs[name].value
      }

      const res = globalShortcut.register(shortcuts[name], shortcutsMethods[name])
      if (!res) {
        // eslint-disable-next-line no-console
        console.log('>>> module >> shortcut > shortcutInit failed', name, shortcuts[name])
      }
      else {
        count++
      }
    }

    return count
  }
  catch (e) {
    // eslint-disable-next-line no-console
    console.error('>>> module >> shortcut > shortcutsInit', e)
    return false
  }
}

/**
 * 注销快捷键
 */
export function unregister() {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll()
}

/**
 * 校验全局快捷键是否已经注册
 * @param name - 快捷键名称，配置文件 key
 */
export function checkShortcut(name: string, shortcut: string) {
  try {
    return globalShortcut.isRegistered(shortcut) ? 1 : 2
  }
  catch (e) {
    // eslint-disable-next-line no-console
    console.log('>>> module >> shortcut > checkShortcut', e)
    return false
  }
}

/**
 * 重新设置快捷键
 * @param name - 快捷键名称
 * @param shortcut - 快捷键
 */
export async function resetShortcut(name: string, shortcut: string) {
  try {
    const shortcuts: ShortcutConfig = configDefault

    const configs = await getConfigsByGroup('shortcut')
    if (configs) {
      if (configs[name] && configs[name].value)
        shortcuts[name] = configs[name].value
    }
    if (!shortcuts[name])
      return false

    globalShortcut.unregisterAll() // TODO: 注销单个快捷键不生效，暂时先注销所有快捷键

    const res = globalShortcut.register(shortcut, shortcutsMethods[name])
    // eslint-disable-next-line no-console
    console.log('>>> module >> shortcut > resetShortcut', name, shortcuts[name], shortcut, res)
    return res
  }
  catch (e) {
    // eslint-disable-next-line no-console
    console.log('>>> module >> shortcut > resetShortcut', e)
    return false
  }
}
