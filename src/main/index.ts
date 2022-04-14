import os from 'os'
import { app, BrowserWindow } from 'electron'

import { ConfigEnum } from './config/enum'

import { init as storeInit } from './store'
import { shortcutsInit, unregister } from './modules/shortcuts'
import { trayInit } from './modules/tray'
import { menuInit } from './modules/menu'
import { dbInit } from './modules/db'
import { messageInit } from './modules/message'
import { windowInit } from './modules/window'

const isWin7 = os.release().startsWith('6.1')
if (isWin7) app.disableHardwareAcceleration()

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}


app.whenReady().then(async() => {
  app.setName('Contea')

  await storeInit()
  await storeInit(ConfigEnum.EXTENSION_COMMAND)
  shortcutsInit()
  trayInit()
  menuInit()
  dbInit()
  messageInit()

  windowInit()
})

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('second-instance', () => {
  if (win) {
    // someone tried to run a second instance, we should focus our window.
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    windowInit()
  }
})

app.on('will-quit', () => {
  unregister()
})
