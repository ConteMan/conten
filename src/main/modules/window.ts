import path from 'path'
import { app, BrowserWindow, BrowserView } from 'electron'

import type { ConfigDetail } from '~/main/config'
import { getStore } from '~/main/store'
import { execScript } from '../services/juejin'

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
      spellcheck: false,
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

export async function viewWindowInit(show: boolean = false) {
  if (global.wins?.view) {
    global.wins['view'].show()
    return true
  }

  const configStore = getStore()
  if (!configStore)
    return false

  const { x, y, width, height } = configStore.get('win.bounds') as ConfigDetail['win']['bounds']

  const viewWin = new BrowserWindow({
    show: false,
    x: x + width + 4,
    y,
    width: 300,
    height,
    frame: true, //无框
    transparent: false, //透明
    focusable: true,
    alwaysOnTop: false,
    webPreferences: {
      webSecurity: false,
    }
  })

  if (process.platform === 'darwin') {
    app.dock.setIcon(path.join(__dirname, '../public/images/logo_32.png'))
  }

  viewWin.on('closed', () => {
    console.log(`viewWinBrowserView destroyed`)
    delete global.wins['view']
  })

  viewWin.loadURL('')
  
  global.wins = {
    view: viewWin,
    ...global.wins,
  }
  
  await viewWinBrowserView()

  if (show) {
    viewWin.once('ready-to-show', () => {
      viewWin?.show()
    })
  }
}

export async function viewWinBrowserView(url: string = 'https://juejin.cn', showWin: boolean = false) {
  const viewWin = global.wins['view']
  const configStore = getStore()
  if (!configStore)
    return false

  const { height } = configStore.get('win.bounds') as ConfigDetail['win']['bounds']

  const viewWinWidth = 300
  const viewWinTop = 28
  const viewWinHeight = height - viewWinTop
  const view = new BrowserView()
  viewWin.setBrowserView(view)
  view.setAutoResize({
    width: true,
    height: true,
  })
  view.setBounds({ x: 0, y: viewWinTop, width: viewWinWidth, height: viewWinHeight })
  view.webContents.loadURL(url)
  view.webContents.openDevTools()
  
  if (showWin)
    viewWin.show()

  // const scriptRes = await execScript()
  // console.log('>>> scriptRes', scriptRes)
}