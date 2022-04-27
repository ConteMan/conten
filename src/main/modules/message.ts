import { app, ipcMain, dialog } from "electron"

import { DB } from "~/main/config"
import { ConfigEnum } from '~/main/config/enum'
import { start as koaStart, stop as koaStop } from "~/main/server/koa"
import { getStatus } from "~/main/services/status"
import { getStoreDetail } from "~/main/store"
import { isObject } from "~/main/utils"
import TestService from '~/main/services/test/test'
import { reconnect } from "~/main/modules/db"
import { getWeather } from "~/main/services/weather"

import User from '~/main/models/user'

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
        case 'open-folder': {
          dialog.showOpenDialog({})
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

  ipcMain.handle('set-command', async(event, key) => {
    await global.store?.[ConfigEnum.EXTENSION_COMMAND].set('inbox', ['command'])
    return (await global.store?.[ConfigEnum.EXTENSION_COMMAND].get('inbox'))
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
          await reconnect()
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

  ipcMain.handle('sqlite3-create', async() => {
    try {
      if (!User) return false
      await User.sync({ force: true })
      await User.create({ first_name: 'John', last_name: 'Hancock' })

      const users = await User.findAll()
      sendToRenderer('success', `sqlite3-create ${JSON.stringify(users)}`)
      return users
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
}

export { sendToRenderer, messageInit }
