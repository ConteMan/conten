import { BrowserWindow, app } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import ipc from '../preload/ipc'
import { WINDOW_NAME } from './constants'

import { WindowsMain } from './app/windows'
import { sync as SqliteSync } from './app/dbSqlite3'
import { ipcApiInit } from './app/ipcApi'
import { shortcutInit } from './app/shortcut'

function createWindow(): void {
  // Create the browser window.
  const windowMain = WindowsMain.getInstance()
  windowMain.newWindow({ module: WINDOW_NAME.APP })
  ipc()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('me.conteman.contea')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  await createWindow()

  await SqliteSync() // 数据库初始化
  await ipcApiInit() // 主线程接口初始化
  await shortcutInit() // 注册全局快捷键

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0)
      createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin')
    app.quit()
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
