import os from 'os'
import { BrowserWindow, app } from 'electron'

import './modules/init'

import { storeInit } from './store'
import { shortcutsInit, unregister } from './modules/shortcuts'
import { trayInit } from './modules/tray'
import { menuInit } from './modules/menu'
import { messageInit } from './modules/message'
import { dbInit } from './modules/db'
import { windowInit } from './modules/window'
import Schedule from './services/schedule'

const isWin7 = os.release().startsWith('6.1')
if (isWin7)
  app.disableHardwareAcceleration()

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

app.whenReady().then(async () => {
  app.setName('Contea')

  storeInit()
  shortcutsInit()
  trayInit()
  menuInit()
  await dbInit()
  messageInit()
  await Schedule.init()

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
