import { BrowserWindow, app } from 'electron'

import '@main/modules/boot'

import { appStoreInit, storeInit } from '@main/modules/store'
import { shortcutsInit, unregister } from '@main/modules/shortcuts'
import { trayInit } from '@main/modules/tray'
import { menuInit } from '@main/modules/menu'
import { appInit } from '@main/modules/app'
import { dbInit } from '@main/modules/db'
import { messageInit } from '@main/modules/message'
import { scheduleInit } from '@main/services/schedule'
import { windowInit } from '@main/modules/window'

app.whenReady().then(async () => {
  appStoreInit()

  storeInit()
  shortcutsInit()
  trayInit()
  menuInit()

  appInit()
  dbInit()
  messageInit()
  scheduleInit()

  windowInit()
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
