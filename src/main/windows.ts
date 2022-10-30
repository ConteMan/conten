import * as path from 'path'
import { BrowserWindow, app, shell } from 'electron'
import { is } from '@electron-toolkit/utils'

export interface CreateWindowOptions {
  module: string
  center?: boolean
  url?: string
  width?: number
  height?: number
  maximizable?: boolean
}

export interface winModule {
  id: number
  url: string
}

export class WindowsMain {
  BrowserWindowsMap = new Map<number, BrowserWindow>()
  winModulesMap = new Map<string, winModule>()
  constructor() {}

  static instance: WindowsMain

  static getInstance() {
    if (!this.instance)
      this.instance = new WindowsMain()

    return this.instance
  }

  getWin(winId: number) {
    return this.BrowserWindowsMap.get(winId)
  }

  detWin(winId: number) {
    const win = this.BrowserWindowsMap.get(winId)
    try {
      if (this.BrowserWindowsMap.size > 1) {
        let key = ''
        this.winModulesMap.forEach((item, k) => {
          if (item.id === winId)
            key = k
        })
        if (key !== '')
          this.winModulesMap.delete(key)

        this.BrowserWindowsMap.delete(winId)
      }
      win?.close()
    }
    catch (error) {}
  }

  newWindow(options: CreateWindowOptions): BrowserWindow {
    if (this.winModulesMap.has(options.module)) {
      const id = this.winModulesMap.get(options.module)!.id
      const win = this.BrowserWindowsMap.get(id)
      win?.focus()
      return win!
    }
    options.url = options.url || ''
    options.width = options.width || 990
    options.height = options.height || 570
    options.maximizable = options.maximizable !== undefined ? options.maximizable : true
    const currentWindow = BrowserWindow.getFocusedWindow()
    const coord: { x: number | undefined; y: number | undefined } = { x: undefined, y: undefined }
    if (currentWindow && !options.center) {
      const [currentWindowX, currentWindowY] = currentWindow.getPosition()
      coord.x = currentWindowX + 15
      coord.y = currentWindowY + 15
    }
    const mainWindow = new BrowserWindow({
      width: options.width,
      height: options.height,
      show: false,
      frame: false,
      ...coord,
      center: options.center,
      maximizable: options.maximizable,
      autoHideMenuBar: true,
      ...(process.platform === 'linux'
        ? {
            icon: path.join(__dirname, '../../build/icon.png'),
          }
        : {}),
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        spellcheck: false,
        nodeIntegrationInWorker: true,
      },

      transparent: false, // 透明
      titleBarStyle: 'customButtonsOnHover', // 自定义按钮，鼠标悬浮展示
      trafficLightPosition: {
        x: 16,
        y: 8,
      },
      focusable: true,
      roundedCorners: true,
    })

    if (process.platform === 'darwin')
      app.dock.setIcon(path.join(__dirname, '../../build/icon.png'))

    mainWindow.on('close', () => {
      this.detWin(mainWindow.id)
    })

    mainWindow.on('ready-to-show', () => {
      // eslint-disable-next-line no-console
      console.log('ready-to-show')
      mainWindow.webContents.executeJavaScript(`window.winViewId=${mainWindow.id}`)
      mainWindow.webContents.executeJavaScript(`window.winViewModule="${options.module}"`)
      mainWindow.show()
      mainWindow.webContents.send('onLoad', options.module)
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })
    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env.ELECTRON_RENDERER_URL) {
      mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL + options.url)
    }
    else {
      mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'), {
        hash: options.url,
        search: `winViewId=${mainWindow.id}`,
      })
    }

    this.BrowserWindowsMap.set(mainWindow.id, mainWindow)
    this.winModulesMap.set(options.module, { id: mainWindow.id, url: options.url || '' })
    return mainWindow
  }
}
