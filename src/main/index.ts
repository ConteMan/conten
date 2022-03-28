import os from 'os'
import path from 'path'
import fs from 'fs'
import { app, BrowserWindow, ipcMain, dialog, globalShortcut, Tray, Menu } from 'electron'

import type http from 'http'
import type koa from 'koa'
import Server from './modules/server/koa'

const initSqlJs = require('sql.js')


// https://stackoverflow.com/questions/42524606/how-to-get-windows-version-using-node-js
const isWin7 = os.release().startsWith('6.1')
if (isWin7) app.disableHardwareAcceleration()

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null
let koaApp: koa | null = null
let httpServer: http.Server | null = null
let ServerInstance: Server | null = null
let tray = null

let dragBarPressed = false
let windowMovingInterval: NodeJS.Timeout | null = null
let windowMoving = false


async function getSQLiteData() {
  const fullPath = path.join(__dirname, '../public/db/sql.db')
  const fileBuffer = fs.readFileSync(fullPath);

  const SQL = await initSqlJs()
  const db = new SQL.Database(fileBuffer)
  
  const res = await db.exec('SELECT name,hired_on FROM employees ORDER BY hired_on;')
  return JSON.stringify(res)
}

async function createWindow() {
  win = new BrowserWindow({
    show: false,
    icon: path.join(__dirname, '../public/images/logo_32.ico'),
    center: true,
    width: 1366,
    height: 768,
    // minWidth: 1366,
    // minHeight: 768,
    // frame: false, //无框
    // transparent: false, //透明
    titleBarStyle: 'hidden',
    focusable: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.cjs'),
    },
  })

  if (process.platform === 'darwin') {
    app.dock.setIcon(path.join(__dirname, '../public/images/logo_32.png'))
  }

  win.once('ready-to-show', () => {
    win?.show()
  })

  win.on('will-move', () => {
    console.log('move >', win?.getContentBounds())
  })

  win.on('blur', () => {
    win?.setAlwaysOnTop(false)
  })

  // win.setMenu(null)

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, '../renderer/index.html'))
  } else {
    const pkg = await import('../../package.json')
    const url = `http://${pkg.env.HOST || '127.0.0.1'}:${pkg.env.PORT}`

    win.loadURL(url)
    win.webContents.openDevTools()
  }

  // 消息监听
  ipcMain.on('indexMsg', async(event, msg) => {
    console.log('msg: ', msg)
    
    if (msg) {
      const { type, data } = msg
      switch (type) {
        case 'start':
          if (!ServerInstance) {
            ServerInstance = new Server()
            const { app, server } = await ServerInstance.start()
            koaApp = app
            httpServer = server
          }
          event.reply('indexMsg', { type, data: !!ServerInstance })
          break
        case 'stop':
          if (ServerInstance) {
            const res = await ServerInstance?.stop()
          }
          ServerInstance = null
          event.reply('indexMsg', { type, data: !!ServerInstance })
          break
        case 'open-folder':
          dialog.showOpenDialog({})
          break
        case 'get-user-data-path':
            event.reply('indexMsg', { type: 'get-user-data-path', data: await app.getPath('userData') })
          break
        case 'drag-bar-pressed':
          dragBarPressed = data
          // if (!data) {
          //   win?.setPosition(20, 100)
          //   win?.setSize(200, 768)
          // }
          console.log('dragBarPressed:', dragBarPressed)
          break
        default:
          break
      }
    }
  })
}

app.once('ready', () => {
  app.setName('Contea')
})

app.whenReady().then(() => {
  createWindow()

  // Register a 'CommandOrControl+X' shortcut listener.
  const ret = globalShortcut.register('Alt+X', () => {
    console.log('Alt+X is pressed')
    win?.show()
    win?.moveTop()
  })

  if (!ret) {
    console.log('registration failed')
  }

  // Check whether a shortcut is registered.
  console.log(globalShortcut.isRegistered('CommandOrControl+X'))

  tray = new Tray(path.join(__dirname, '../public/images/logo_16.png'))

  const isMac = process.platform === 'darwin'
  if (isMac) {
    const template = [
      {
        label: app.getName(),
        submenu: [
          { label: 'About Contea', role: 'about' },
          { type: 'separator' },
          { label: '隐藏', role: 'hide' },
          { type: 'separator' },
          {
            label: '退出',
            accelerator: 'Command+Q',
            click() {
              app.quit()
            },
          },
        ],
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          ...(isMac ? [
            { role: 'pasteAndMatchStyle' },
            { role: 'delete' },
            { role: 'selectAll' },
            { type: 'separator' },
            {
              label: 'Speech',
              submenu: [
                { role: 'startSpeaking' },
                { role: 'stopSpeaking' }
              ]
            }
          ] : [
            { role: 'delete' },
            { type: 'separator' },
            { role: 'selectAll' }
          ])
        ]
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'zoom' },
          ...(isMac ? [
            { type: 'separator' },
            { role: 'front' },
            { type: 'separator' },
            { role: 'window' }
          ] : [
            { role: 'close' }
          ])
        ]
      },
    ]
  
    Menu.setApplicationMenu(Menu.buildFromTemplate(template as any))
  }
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
    createWindow()
  }
})

app.on('will-quit', () => {
  // Unregister a shortcut.
  globalShortcut.unregister('CommandOrControl+X')

  // Unregister all shortcuts.
  globalShortcut.unregisterAll()
})

// @TODO
// auto update
/* if (app.isPackaged) {
  app.whenReady()
    .then(() => import('electron-updater'))
    .then(({ autoUpdater }) => autoUpdater.checkForUpdatesAndNotify())
    .catch((e) =>
      // maybe you need to record some log files.
      console.error('Failed check update:', e)
    )
} */
