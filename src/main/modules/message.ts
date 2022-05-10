import { app, ipcMain, BrowserView } from "electron"

import { DB } from "~/main/config"
import { ConfigEnum } from '~/main/config/enum'
import { start as koaStart, stop as koaStop } from "~/main/server/koa"
import { getStatus } from "~/main/services/status"
import { getStoreDetail } from "~/main/store"
import { isObject } from "~/main/utils"
import TestService from '~/main/services/test/test'
import { reconnectMongoDB } from "~/main/modules/db"
import { getWeather } from "~/main/services/weather"
import { getUser } from "~/main/services/user"
import { getConfigsByGroup, setConfig } from '~/main/services/config'
import { getPackageInfo } from "~/main/services/package"
import { viewWindowInit } from "~/main/modules/window"
import { execScript } from "~/main/services/juejin"
import WakaTime from '~/main/services/wakatime'

function sendToRenderer(type: string, data: any) {
  console.log('sendToRenderer: ', type, data)
  const message = {
    type,
    data,
  }
  global.win?.webContents.send('message', message)
}

async function messageInit() {
  // 消息监听
  ipcMain.on('indexMsg', async(event, msg) => {
    console.log('indexMsg: ', msg)
    
    if (msg) {
      const { type, data } = msg
      switch (type) {
        case 'start-koa': {
          const res = await koaStart()
          sendToRenderer(`${res ? 'success' : 'error'}`, `启动${res ? '!' : '失败'}`)
          event.reply('indexMsg', { type, data: res })
          break
        }
        case 'stop-koa': {
          const res = await koaStop()
          sendToRenderer(`${res ? 'success' : 'error'}`, `停止${res ? '!' : '失败'}`)
          event.reply('indexMsg', { type, data: res })
          break
        }
        case 'get-user-data-path': {
          event.reply('indexMsg', { type: 'get-user-data-path', data: await app.getPath('userData') })
          break
        }
        case 'drag-bar-pressed': {
          const dragBarPressed = data
          console.log('dragBarPressed:', dragBarPressed)
          break
        }
        case 'get-user': {
          const data = await TestService.getUser()
          event.reply('indexMsg', { type: 'get-user', data })
          break;
        }
        default:
          break
      }
    }
  })

  ipcMain.handle('getStore', async(event, key) => {
    return await global.store?.[ConfigEnum.DEFAULT_NAME].store
  })

  ipcMain.handle('getStorePath', (event, key) => {
    return global.store?.[ConfigEnum.DEFAULT_NAME]?.path
  })

  ipcMain.handle('pin-top', async(event, key) => {
    const isTop = global.win?.isAlwaysOnTop()
    await global.win?.setAlwaysOnTop(!isTop)
    return global.win?.isAlwaysOnTop()
  })

  ipcMain.handle('get-status', async() => {
    return await getStatus()
  })

  ipcMain.handle('save-settings', async(event, data) => {
    try {
      if (!isObject(data)) {
        data = JSON.parse(data)
      }
      const newDBUrl = data.mongodb?.[0].url
      if (newDBUrl) {
        const oldSetting = global.store?.[ConfigEnum.DEFAULT_NAME].get('db.mongodb') as DB[]
        const oldUrl = oldSetting ? oldSetting?.find((item: any) => item.selected)?.url : ''
        await global.store?.[ConfigEnum.DEFAULT_NAME].set('db.mongodb', data.mongodb)
        if (newDBUrl !== oldUrl) {
          await reconnectMongoDB()
        }
        sendToRenderer('success', `保存成功`)
        return true
      }
      return false
    }
    catch(e) {
      console.log(e)
      sendToRenderer('error', `保存失败`)
    }
    return true
  })

  ipcMain.handle('get-settings', async(event, key) => {
    return await getStoreDetail()
  })

  ipcMain.handle('sqlite3', async() => {
    try {
      const user = await getUser()
      return user
    }
    catch(e) {
      console.log('sqlite3: ', e)
    }
    return false
  })

  ipcMain.handle('sqlite3-create', async() => {
    try {
      return true
    }
    catch(e) {
      console.log('sqlite3-create: ', e)
    }
    sendToRenderer('error', `sqlite3-create 保存失败`)
    return false
  })

  ipcMain.handle('get-weather', async(event, key) => {
    return await getWeather()
  })

  ipcMain.handle('get-configs', async(event, data) => {
    try {
      if (!isObject(data)) {
        data = JSON.parse(data)
      }
      const { group_key } = data
      return await getConfigsByGroup(group_key)
    }
    catch(e) {
      return false
    }
  })

  ipcMain.handle('save-configs', async(event, data) => {
    try {
      if (!isObject(data)) {
        data = JSON.parse(data)
      }
      for (const item of data) {
        const saveData = {
          group_key: item.group_key,
          key: item.key,
          value: item.value,
        }
        await setConfig(saveData)
      }
      return true
    }
    catch(e) {
      return false
    }
  })

  ipcMain.handle('get-package-info', async(event, data) => {
    return getPackageInfo()
  })

  ipcMain.handle('init-view-window', async(event, data) => {
    await viewWindowInit()
  })

  ipcMain.handle('get-view-cookie', async(event, data) => {
    const cookies = await global.wins.view.getBrowserView()?.webContents.session.cookies.get({})
    return cookies
  })

  ipcMain.handle('hide-view-window', async(event, data) => {
    global.wins.view.isVisible() ? global.wins.view.hide() : global.wins.view.show()
    return true
  })

  ipcMain.handle('run-script-in-view-window', async(event, data) => {
    return execScript()
  })

  ipcMain.handle('wakatime-summaries', async(event, msg) => {
    return await WakaTime.getData()
  })

  ipcMain.handle('api', async(event, data) => {
    const { name, data: apiData } = data
    switch (name) {
      case 'wakatime-summaries': {
        const { range } = apiData
        return await WakaTime.getDataByCache(range ?? undefined)
      }
      default:
        break
    }
  })
}

export { sendToRenderer, messageInit }
