import { app, ipcMain, dialog } from "electron"

import { ConfigEnum } from '~/main/config/enum'
import { init as storeInit } from '~/main/store'
import { start as koaStart, stop as koaStop } from "~/main/server/koa"
import { getStatus, receiveStatus } from "~/main/services/status"
import TestService from '~/main/services/test/test'

function sendToRenderer(type: string, data: any) {
  const message = {
    type,
    data,
  }
  global.win?.webContents.send('message', message)
}

async function messageInit() {
  const messages = {
    'get-status': getStatus(),
  }
  
  ipcMain.handle('get-status', async(event, data) => {
    return await messages['get-status']
  })

  // 消息监听
  ipcMain.on('indexMsg', async(event, msg) => {
    console.log('msg: ', msg)
    
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

  ipcMain.handle('overwriteStore', async(event, key) => {
    return (await storeInit(ConfigEnum.DEFAULT_NAME, true))?.store
  })

  ipcMain.handle('changeDB', async(event, key) => {
    await global.store?.[ConfigEnum.DEFAULT_NAME].set('db.mongodb.url', 'mongodb+srv://ConteMan:uiHiUdpa52tssPok@conteworld.xudmc.mongodb.net/test?authSource=admin&replicaSet=atlas-8yezaw-shard-0&readPreference=primary&ssl=true')
    return (await global.store?.[ConfigEnum.DEFAULT_NAME].get('db.mongodb.url'))
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
}

export { sendToRenderer, messageInit }
