import { BrowserWindow, app } from 'electron'

import '@main/modules/boot'

import { shortcutsInit, unregister } from '@main/modules/shortcuts'
import { trayInit } from '@main/modules/tray'
import { menuInit } from '@main/modules/menu'
import { appInit } from '@main/modules/app'
import { messageInit } from '@main/modules/message'
import { dbInit } from '@main/modules/db'
import { windowInit } from '@main/modules/window'
import Schedule from '@main/services/schedule'
import { appStoreInit, storeInit } from '~/main/modules/store'

app.whenReady().then(async () => {
  await appStoreInit()

  storeInit()
  shortcutsInit()
  trayInit()
  menuInit()

  await appInit()
  await dbInit()
  await messageInit()
  await Schedule.init()

  await windowInit()
})

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin')
    app.quit()
})

app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized())
      win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length)
    allWindows[0].focus()
  else
    windowInit()
})

app.on('will-quit', () => {
  unregister()
})
