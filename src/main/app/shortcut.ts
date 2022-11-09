import { globalShortcut } from 'electron'
import { SHORTCUTS } from '@main/constants'
import { showApp } from './windows'

export const shortcutInit = () => {
  const shortcutMap = new Map([
    [SHORTCUTS.APP_VISIBLE, showApp], // 主界面显示/隐藏
  ] as Iterable<[string, any]>)

  const shortcutKeyMap = new Map([
    [SHORTCUTS.APP_VISIBLE, 'Alt+X'],
  ] as Iterable<[string, string]>)

  try {
    shortcutMap.forEach((val, key) => {
      const shortcutKey = shortcutKeyMap.get(key)
      if (shortcutKey) {
        const res = globalShortcut.register(shortcutKey, val)
        // eslint-disable-next-line no-console
        console.log('[ shortcut ] >', key, shortcutKey, res)
      }
    })
  }
  catch (e) {}
}
