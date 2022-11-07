import * as path from 'path'
import { BrowserWindow, app, shell } from 'electron'
import { is } from '@electron-toolkit/utils'
import _ from 'lodash'
import { WINDOW_NAME, WINDOW_STORE_KEY } from '@main/constants'
import Store from './store'

export interface CreateWindowOptions {
  module: string
  center?: boolean
  url?: string
  x?: number
  y?: number
  width?: number
  height?: number
  alwaysOnTop?: boolean
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

  getWinByModule(moduleName: string) {
    const winInfo = this.winModulesMap.get(moduleName)
    return winInfo ? this.BrowserWindowsMap.get(winInfo.id) : false
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
    catch (e) {}
  }

  detWinByModule(moduleName: string) {
    const winInfo = this.winModulesMap.get(moduleName)
    if (winInfo) {
      this.winModulesMap.delete(moduleName)
      const winId = winInfo.id
      const win = this.BrowserWindowsMap.get(winId)
      this.BrowserWindowsMap.delete(winId)
      win?.close()
    }
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
    options.alwaysOnTop = options.alwaysOnTop || false
    options.maximizable = options.maximizable !== undefined ? options.maximizable : true
    const currentWindow = BrowserWindow.getFocusedWindow()
    const coord: { x: number | undefined; y: number | undefined } = { x: options.x ?? undefined, y: options.y ?? undefined }
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
      alwaysOnTop: options.alwaysOnTop,
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

    function storeBound() {
      const store = Store.getStore()
      if (store)
        store.set(WINDOW_STORE_KEY.BOUNDS, mainWindow.getNormalBounds())
    }

    mainWindow.on('resize', _.debounce(() => {
      storeBound()
    }, 150))

    mainWindow.on('move', _.debounce(() => {
      storeBound()
    }, 150))

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

export interface PinTopParams {
  moduleName: string
  status?: boolean
}

/**
 * 窗口置顶
 * @param args
 * - @param moduleName - 窗口模块名
 * - @param status - 是否置顶
 */
export const pinTop = (args: PinTopParams = { moduleName: WINDOW_NAME.APP, status: undefined }) => {
  const { moduleName, status } = args
  if (!moduleName)
    return false

  const windowMain = WindowsMain.getInstance()
  const win = windowMain.getWinByModule(moduleName)
  if (win) {
    const isOnTop = win.isAlwaysOnTop()
    win.setAlwaysOnTop(status ?? !isOnTop)

    const resIsOnTop = win.isAlwaysOnTop()
    const store = Store.getStore()
    if (store)
      store.set(WINDOW_STORE_KEY.PIN_TOP, resIsOnTop)
    return resIsOnTop
  }
  return false
}

export type ShowAppParams = PinTopParams

/**
 * 窗口显隐
 * @param args
 * - @param moduleName - 窗口模块名
 * - @param status - 是否显示
 */
export const showApp = (args: ShowAppParams = { moduleName: WINDOW_NAME.APP, status: undefined }) => {
  const { moduleName } = args
  if (!moduleName)
    return false

  const windowMain = WindowsMain.getInstance()
  const win = windowMain.getWinByModule(moduleName)
  if (win) {
    if (win.isVisible()) {
      if (win.isFocused())
        win.hide()
      else
        win.show()
    }
    else {
      win.show()
    }
    return true
  }
  return false
}
