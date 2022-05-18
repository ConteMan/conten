import { app, ipcMain } from 'electron'

import { isString } from 'lodash'
import type { DB } from '~/main/config'
import { ConfigEnum } from '~/main/config/enum'
import { start as koaStart, stop as koaStop } from '~/main/server/koa'
import { getStoreDetail } from '~/main/store'
import { isObject } from '~/main/utils'
import { reconnectMongoDB } from '~/main/modules/db'
import { getWeather } from '~/main/services/weather'
import { getConfigsByGroup, moduleEnable, setConfig } from '~/main/services/config'
import { getPackageInfo } from '~/main/services/package'
import { viewWindowInit } from '~/main/modules/window'
import { checkIn as JuejinCheckIn } from '~/main/services/juejin'

import WakaTime from '~/main/services/wakatime'
import TapTap from '~/main/services/taptap'

/**
 * 向渲染层发送消息
 * @param type - 消息类型
 * @param data - 消息数据
 */
function sendToRenderer(type: string, data: any) {
  const message = {
    type,
    data,
  }
  global.win?.webContents.send('message', message)
}

/**
 * 消息监听服务初始化
 */
async function messageInit() {
  ipcMain.on('indexMsg', async (event, msg) => {
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
          // eslint-disable-next-line no-console
          console.log('dragBarPressed:', dragBarPressed)
          break
        }
        default:
          break
      }
    }
  })

  ipcMain.handle('getStore', async () => {
    return await global.store?.[ConfigEnum.DEFAULT_NAME].store
  })

  ipcMain.handle('getStorePath', () => {
    return global.store?.[ConfigEnum.DEFAULT_NAME]?.path
  })

  ipcMain.handle('pin-top', async () => {
    const isTop = global.win?.isAlwaysOnTop()
    await global.win?.setAlwaysOnTop(!isTop)
    return global.win?.isAlwaysOnTop()
  })

  ipcMain.handle('save-settings', async (event, data) => {
    try {
      if (!isObject(data))
        data = JSON.parse(data)

      const newDBUrl = data.mongodb?.[0].url
      if (newDBUrl) {
        const oldSetting = global.store?.[ConfigEnum.DEFAULT_NAME].get('db.mongodb') as DB[]
        const oldUrl = oldSetting ? oldSetting?.find((item: any) => item.selected)?.url : ''
        await global.store?.[ConfigEnum.DEFAULT_NAME].set('db.mongodb', data.mongodb)
        if (newDBUrl !== oldUrl)
          await reconnectMongoDB()

        sendToRenderer('success', '保存成功')
        return true
      }
      return false
    }
    catch (e) {
      sendToRenderer('error', '保存失败')
    }
    return true
  })

  ipcMain.handle('get-settings', async () => {
    return await getStoreDetail()
  })

  ipcMain.handle('get-weather', async () => {
    return await getWeather()
  })

  ipcMain.handle('get-configs', async (event, data) => {
    try {
      if (!isObject(data))
        data = JSON.parse(data)

      const { group_key } = data
      return await getConfigsByGroup(group_key)
    }
    catch (e) {
      return false
    }
  })

  ipcMain.handle('save-configs', async (event, data) => {
    try {
      if (!isObject(data))
        data = JSON.parse(data)

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
    catch (e) {
      return false
    }
  })

  ipcMain.handle('get-package-info', async () => {
    return getPackageInfo()
  })

  ipcMain.handle('init-view-window', async () => {
    await viewWindowInit()
  })

  ipcMain.handle('get-view-cookie', async () => {
    const cookies = await global.wins.view.getBrowserView()?.webContents.session.cookies.get({})
    return cookies
  })

  ipcMain.handle('hide-view-window', async () => {
    global.wins.view.isVisible() ? global.wins.view.hide() : global.wins.view.show()
    return true
  })

  ipcMain.handle('wakatime-summaries', async () => {
    return await WakaTime.getData()
  })

  ipcMain.handle('api', async (event, data) => {
    if (isString(data))
      data = JSON.parse(data)

    const { name, data: apiData } = data
    switch (name) {
      case 'wakatime-summaries': {
        const { range, refresh } = apiData
        return await WakaTime.getDataByCache(range ?? undefined, refresh ?? false)
      }
      case 'juejin-checkin': {
        return await JuejinCheckIn()
      }
      case 'hide-traffic-button': {
        const { status } = apiData
        global.win?.setWindowButtonVisibility(status)
        return global.win?.getTrafficLightPosition()
      }
      case 'get-weather': {
        const { source, refresh } = apiData
        return await getWeather(source ?? 'cma', refresh ?? false)
      }
      case 'taptap-view-http-data': {
        const { url } = apiData
        const winInfo = TapTap.getViewHttpData(url ?? undefined)
        if (winInfo && global?.wins[winInfo.name])
          global?.wins[winInfo.name].showInactive()
        return true
      }
      case 'taptap-profile': {
        const { refresh } = apiData
        return TapTap.profile(refresh ?? false)
      }
      case 'taptap-detail': {
        const { refresh } = apiData
        return TapTap.detail(refresh ?? false)
      }
      case 'module-enable': {
        const { module } = apiData
        return await moduleEnable(module)
      }
      default:
        // eslint-disable-next-line no-console
        console.log('>>>>default:', name)
        break
    }
  })
}

export { sendToRenderer, messageInit }
