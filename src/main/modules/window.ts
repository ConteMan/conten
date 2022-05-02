import path from 'path'
import { app, BrowserWindow } from 'electron'

import type { ConfigDetail } from '~/main/config'
import { getStore } from '~/main/store'

global.win = null

export async function windowInit() {
  const configStore = getStore()
  if (!configStore)
    return false

  const { x, y, width, height } = configStore.get('win.bounds') as ConfigDetail['win']['bounds']

  win = new BrowserWindow({
    show: false,
    icon: path.join(__dirname, '../public/images/logo_32.ico'),
    x,
    y,
    width,
    height,
    frame: false, //无框
    transparent: false, //透明
    titleBarStyle: 'customButtonsOnHover', //自定义按钮，鼠标悬浮展示
    trafficLightPosition: {
      x: 16,
      y: 8,
    },
    focusable: true,
    alwaysOnTop: false,
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

  function setWinBounds () {
    const configStore = getStore()
    const bounds = win?.getBounds()
    if (bounds && configStore) {
      configStore.set('win.bounds', bounds)
    }
  }

  win.on('resized', () => {
    setWinBounds()
  })

  win.on('moved', () => {
    setWinBounds()
  })

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, '../renderer/index.html'))
  } else {
    const pkg = await import('../../../package.json')
    const url = `http://${pkg.env.HOST || '127.0.0.1'}:${pkg.env.PORT}`

    win.loadURL(url)
    win.webContents.openDevTools()
  }
}