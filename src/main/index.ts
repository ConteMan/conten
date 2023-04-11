import { BrowserWindow, app } from 'electron'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { WINDOW_NAME, WINDOW_STORE_KEY } from '@main/constants'
import { WindowsMain } from '@main/app/windows'
import { sync as SqliteSync } from '@main/app/dbSqlite3'
import { ipcApiInit } from '@main/app/ipcApi'
import { shortcutInit } from '@main/app/shortcut'
import ipc from '@preload/ipc'
import Store from '@main/app/store'

import type { CreateWindowOptions, StoreWin } from '@main/types'

function createAppWindow(): void {
  let windowOption: CreateWindowOptions = { module: WINDOW_NAME.APP }
  const winStore = Store.getConf(WINDOW_STORE_KEY.ROOT) as StoreWin
  if (winStore)
    windowOption = { ...windowOption, ...winStore.bounds, alwaysOnTop: winStore.pinTop }
  const windowMain = WindowsMain.getInstance()
  windowMain.newWindow(windowOption)

  Store.getStore()?.set('test.createAppWindow', (is.dev ? 'dev' : 'production') + new Date().getTime())
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('me.conteman.contea')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipc()
  ipcApiInit() // 主线程接口初始化
  SqliteSync() // SQLite 数据库初始化
  shortcutInit() // 注册全局快捷键
  createAppWindow() // 创建窗口

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0)
      createAppWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin')
    app.quit()
})
