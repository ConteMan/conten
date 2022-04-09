import path from 'path'
import { app, BrowserWindow } from 'electron'

global.win = null

export async function windowInit() {
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

  win.on('will-move', () => {
    console.log('move >', win?.getContentBounds())
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