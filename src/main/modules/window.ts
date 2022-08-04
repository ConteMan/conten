import path from 'path'
import { BrowserView, BrowserWindow, app } from 'electron'

import { randomStr } from '@main/utils'
import { getStore } from '~/main/modules/store'

global.win = null

/**
 * 初始化主窗口
 */
export async function windowInit() {
  const configStore = getStore()
  if (!configStore)
    return false

  const { x, y, width, height } = configStore.get('win.bounds') as Contea.ConfigDetail['win']['bounds']
  const { isTop } = configStore.get('app') as Contea.ConfigDetail['app']

  win = new BrowserWindow({
    show: false,
    icon: path.join(__dirname, '../public/images/logo_32.ico'),
    x,
    y,
    width,
    height,
    frame: false, // 无框
    transparent: false, // 透明
    titleBarStyle: 'customButtonsOnHover', // 自定义按钮，鼠标悬浮展示
    trafficLightPosition: {
      x: 16,
      y: 8,
    },
    focusable: true,
    alwaysOnTop: isTop, // 置顶
    roundedCorners: true, // 设置 true，macOS 窗口圆角，但是顶部有 28px 高度鼠标样式无法应用
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.cjs'),
      spellcheck: false,
      nodeIntegrationInWorker: true,
    },
  })

  if (process.platform === 'darwin')
    app.dock.setIcon(path.join(__dirname, '../public/images/logo_32.png'))

  win.once('ready-to-show', () => {
    win?.show()
  })

  function setWinBounds() {
    const configStore = getStore()
    const bounds = win?.getBounds()
    if (bounds && configStore)
      configStore.set('win.bounds', bounds)
  }

  win.on('resized', () => {
    setWinBounds()
  })

  win.on('moved', () => {
    setWinBounds()
  })

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
  else {
    const pkg = await import('../../../package.json')
    const url = `http://${pkg.env.HOST || '127.0.0.1'}:${pkg.env.PORT}`

    win.loadURL(url)
    win.webContents.openDevTools()
  }
}

/**
 * 初始化 BrowserView 窗口
 * @param url - 窗口加载的 url
 * @param show - 是否显示
 * @param once - 是否只执行一次的窗口
 */
export function viewWindowInit(url = '', show = false, once = false, winBounds: Contea.Bounds = { width: 0, height: 0 }) {
  try {
    let winName = 'view'

    if (!once) {
      if (global.wins?.view) {
        if (url) {
          const currentUrl = global.wins.view.webContents.getURL()
          if (currentUrl !== url)
            global.wins.view.webContents.loadURL(url)
        }

        if (show)
          global.wins.view.show()

        return { name: winName, win: global.wins.view }
      }
    }
    else {
      winName = randomStr(5)
    }

    const configStore = getStore()
    if (!configStore)
      return false

    const { width, height } = winBounds
    const { x, y, width: defaultWidth, height: defaultHeight } = configStore.get('win.bounds') as Contea.ConfigDetail['win']['bounds']
    const dealWidth = width > 0 ? width : defaultWidth
    const dealHeight = height > 0 ? height : defaultHeight

    const viewWin = new BrowserWindow({
      show: false,
      x: x + width + 4,
      y,
      width: dealWidth,
      height: dealHeight,
      frame: true, // 无框
      transparent: false, // 透明
      focusable: true,
      alwaysOnTop: false,
      webPreferences: {
        webSecurity: false,
        nodeIntegrationInWorker: true,
      },
    })

    if (process.platform === 'darwin')
      app.dock.setIcon(path.join(__dirname, '../public/images/logo_32.png'))

    viewWin.on('closed', () => {
      if (global.wins[winName])
        delete global.wins[winName]

      if (global.views[winName]) {
        global.views[winName]?.webContents.debugger.detach()
        delete global.views[winName]
      }
    })

    viewWin.loadURL('')

    global.wins = {
      [winName]: viewWin,
      ...global.wins,
    }

    const view = viewWinBrowserView(url, viewWin, { width: dealWidth, height: dealHeight })
    if (view) {
      global.views = {
        [winName]: view,
        ...global.views,
      }
    }

    viewWin.once('ready-to-show', () => {
      if (show)
        viewWin?.showInactive()
    })

    return { name: winName, win: viewWin, view }
  }
  catch (e) {
    console.error(e)
    return false
  }
}

/**
 * BrowserView 附加到窗口
 * @param url - BrowserView 加载的 url
 * @param showWin - 是否显示窗口
 */
export function viewWinBrowserView(url = '', win: BrowserWindow, winBounds: Contea.Bounds): false | BrowserView {
  try {
    if (!url || !win)
      return false

    const viewWin = win
    const configStore = getStore()
    if (!configStore)
      return false

    const { width: dealWidth, height: dealHeight } = winBounds

    const viewWinWidth = dealWidth
    const viewWinTop = 28
    const viewWinHeight = dealHeight - viewWinTop
    const view = new BrowserView()
    viewWin.setBrowserView(view)
    view.setAutoResize({
      width: true,
      height: true,
    })
    view.setBounds({ x: 0, y: viewWinTop, width: viewWinWidth, height: viewWinHeight })
    view.webContents.loadURL(url)
    view.webContents.openDevTools()

    // if (show)
    //   viewWin.show()

    return view
  }
  catch (e) {
    return false
  }
}

/**
 * 获取窗口请求信息
 * @param win - BrowserWindow | BrowserView
 * @param rule - 规则
 * @param callback - 回调
 */
export function getHttpData(win: BrowserWindow | BrowserView, rule: Contea.HttpDataRule, callback: (req: any, res: any) => void) {
  try {
    win.webContents.debugger.attach('1.1')
  }
  catch (err) {
    // eslint-disable-next-line no-console
    console.log('调试器连接失败: ', err)
  }
  win.webContents.debugger.on('detach', (event, reason) => {
    // eslint-disable-next-line no-console
    console.log('调试器由于以下原因而分离 : ', reason)
  })

  try {
    const { url, mineType } = rule

    win.webContents.debugger.on('message', async (event, method, params) => {
      try {
        if (method === 'Network.responseReceived' && params.response) {
          const { url: messageUrl, mimeType } = params.response
          const regex = new RegExp(url)
          if (regex.test(messageUrl) && mimeType === mineType) {
            const response = await win.webContents.debugger.sendCommand('Network.getResponseBody', { requestId: params.requestId })
            callback(params, response)
          }
        }
      }
      catch (e) {
        // eslint-disable-next-line no-console
        console.log(e)
      }
    })
    win.webContents.debugger.sendCommand('Network.enable')
  }
  catch (err) {
    // eslint-disable-next-line no-console
    console.log('getHttpData 调试器连接失败: ', err)
  }
}
