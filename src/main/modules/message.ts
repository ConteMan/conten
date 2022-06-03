import path from 'path'
import { app, dialog, ipcMain } from 'electron'

import fs from 'fs-extra'
import { isString } from 'lodash'
import { sendToRenderer as sendToRendererNew } from '@main/utils/ipcMessage'
import { ConfigEnum } from '@main/enums/configEnum'
import { restart as KoaRestart, start as koaStart, stop as koaStop } from '@main/server/koa'
import { getStore, getStoreDetail, getStorePath, setStore, setStorePath, storeInit } from '@main/modules/store'
import { isObject } from '@main/utils'
import { connectSqlite3, reconnectMongoDB } from '@main/modules/db'
import { getWeather } from '@main/services/weather'
import { getConfigByKey, getConfigsByGroup, moduleEnable, setConfig } from '@main/services/config'
import { getPackageInfo } from '@main/services/package'
import { viewWindowInit } from '@main/modules/window'
import { checkIn as JuejinCheckIn } from '@main/services/juejin'

import WakaTime from '@main/services/wakatime'
import TapTap from '@main/services/taptap'
import { list as infoList } from '@main/services/info'
import schedule from '@main/services/schedule'
import { logList } from '@main/services/log'

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

  ipcMain.handle('save-settings', async (event, data) => {
    try {
      if (!isObject(data))
        data = JSON.parse(data)

      const newDBUrl = data.mongodb?.[0].url
      if (newDBUrl) {
        const oldSetting = global.store?.[ConfigEnum.DEFAULT_NAME].get('db.mongodb') as Contea.DB[]
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

  // 保存配置到 SQLite3
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
    await viewWindowInit('https://v2ex.com', true)
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
      case 'wakatime-summaries': { // WakaTime 汇总数据
        const { range, refresh } = apiData
        return await WakaTime.getDataByCache(range ?? undefined, refresh ?? false)
      }
      case 'juejin-checkin': { // 掘金签到
        return await JuejinCheckIn()
      }
      case 'hide-traffic-button': { // 隐藏窗口操作按钮（macOS）
        const { status } = apiData
        global.win?.setWindowButtonVisibility(status)
        return global.win?.getTrafficLightPosition()
      }
      case 'get-weather': { // 获取天气
        const { source, refresh } = apiData
        return await getWeather(source ?? 'cma', refresh ?? false)
      }
      case 'taptap-view-http-data': { // TapTap HTTP 请求
        const { url } = apiData
        const winInfo = await TapTap.getViewHttpData(url ?? undefined)
        // eslint-disable-next-line no-console
        console.log('winInfo:', winInfo)
        return true
      }
      case 'taptap-profile': { // TapTap 个人信息
        const { refresh } = apiData
        return TapTap.profile(refresh ?? false)
      }
      case 'taptap-detail': { // TapTap 详情
        const { refresh } = apiData
        return TapTap.detail(refresh ?? false)
      }
      case 'module-enable': { // 模块是否开启
        const { module } = apiData
        return await moduleEnable(module)
      }
      case 'configs': { // 根据分组获取配置
        const { group_key } = apiData
        try {
          return await getConfigsByGroup(group_key)
        }
        catch (e) {
          return false
        }
      }
      case 'save-configs': { // 保存配置到 SQLite3
        const { data } = apiData
        try {
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
      }
      case 'config-store': { // 获取前端初始化状态的 store 配置
        let configStore = {}
        const defaultStore = getStore()
        if (defaultStore) {
          const themeWithSystem = defaultStore.get('app.themeWithSystem')
          const isTop = defaultStore.get('app.isTop')
          configStore = { themeWithSystem, isTop, ...configStore }
        }
        return configStore
      }
      case 'get-config-store': { // 获取 store 配置
        try {
          const { key } = apiData
          const defaultStore = getStore()
          if (!defaultStore)
            return false
          const value: any = defaultStore.get(key, false)
          return isString(value) ? value : value.toString()
        }
        catch (e) {
          return false
        }
      }
      case 'set-config-store': { // 保存配置到 store // TODO 完善，封装
        try {
          const { key, value } = apiData
          const keys: any = {
            themeWithSystem: 'app.themeWithSystem',
            isTop: 'app.isTop',
            serverPort: 'server.port',
          }
          if (Object.keys(keys).includes(key)) {
            const configKey = keys[key]
            const setRes = setStore(configKey, value)
            if (setRes) {
              if (key === 'serverPort') {
                if (global.koaApp)
                  await KoaRestart(value)
              }
              sendToRendererNew('store', {
                [key]: value,
              })
            }
          }
          return true
        }
        catch (e) {
          return false
        }
      }
      case 'get-store-path': { // 获取 store 文件路径
        try {
          const { name } = apiData
          return getStorePath(name)
        }
        catch (e) {
          return false
        }
      }
      case 'get-sqlite3-path': { // SQLite3 文件路径
        try {
          const store = getStore()
          if (!store)
            return false
          return store.get('db.sqlite3.path', '')
        }
        catch (e) {
          return false
        }
      }
      case 'set-store-path': { // 设置配置文件路径
        try {
          const { name, path } = apiData
          return setStorePath(name, path)
        }
        catch (e) {
          return false
        }
      }
      case 'reset-store-path': { // 重置默认路径
        const { type, name } = apiData
        if (type === 'config') {
          const oldPath = getStorePath(name)
          try {
            const defaultPath = app.getPath('userData')
            if (oldPath !== defaultPath) {
              const setRes = setStorePath(name, defaultPath)
              if (setRes) {
                const newPath = path.join(defaultPath, `${name}.json`)
                const exist = await fs.pathExists(newPath)
                if (!exist)
                  await fs.copy(path.join(oldPath, `${name}.json`), newPath)
                storeInit(name, true)
              }
              return { path: defaultPath, change: true }
            }
            else {
              return { path: oldPath, change: false }
            }
          }
          catch (e) {
            return { path: oldPath, change: false }
          }
        }
        if (type === 'sqlite3') {
          const store = getStore()
          if (!store)
            return false
          const storeName = 'db.sqlite3.path'
          const oldPath = store.get(storeName, '') as string
          if (!oldPath)
            return false
          try {
            const defaultPath = app.getPath('userData')
            if (oldPath !== defaultPath) {
              store.set(storeName, defaultPath)
              const setRes = store.get(storeName, '')
              if (setRes) {
                const dbFileName = 'sqlite3.db'
                const newPath = path.join(defaultPath, dbFileName)
                const exist = await fs.pathExists(newPath)
                if (!exist)
                  await fs.copy(path.join(oldPath, dbFileName), newPath)
                connectSqlite3(newPath)
              }
              return { path: defaultPath, change: true }
            }
            else {
              return { path: oldPath, change: false }
            }
          }
          catch (e) {
            return { path: oldPath, change: false }
          }
        }
        return false
      }
      case 'select-path-dialog': { // 通过对话窗口选择路径，且复制文件到目标路径，并进行处理
        const { type, name } = apiData
        if (type === 'config') {
          const oldPath = getStorePath(name)
          try {
            const { canceled, filePaths } = await dialog.showOpenDialog({
              title: '选择文件夹',
              defaultPath: oldPath,
              properties: ['openDirectory'],
            })
            if (!canceled && path && oldPath !== filePaths[0]) {
              const setRes = setStorePath(name, filePaths[0])
              if (setRes) {
                const newPath = path.join(filePaths[0], `${name}.json`)
                const exist = await fs.pathExists(newPath)
                if (!exist)
                  await fs.copy(path.join(oldPath, `${name}.json`), newPath)
                storeInit(name, true)
              }
              return { path: filePaths[0], change: true }
            }
            else {
              return { path: oldPath, change: false }
            }
          }
          catch (e) {
            return { path: oldPath, change: false }
          }
        }
        if (type === 'sqlite3') {
          try {
            const store = getStore()
            if (!store)
              return false
            const storeName = 'db.sqlite3.path'
            const oldPath = store.get(storeName, '') as string
            if (!oldPath)
              return false
            const { canceled, filePaths } = await dialog.showOpenDialog({
              title: '选择文件夹',
              defaultPath: oldPath,
              properties: ['openDirectory'],
            })
            if (!canceled && path && oldPath !== filePaths[0]) {
              store.set(storeName, filePaths[0])
              const setRes = store.get(storeName, '')
              if (setRes) {
                const dbFileName = 'sqlite3.db'
                const newPath = path.join(filePaths[0], dbFileName)
                const exist = await fs.pathExists(newPath)
                if (!exist)
                  await fs.copy(path.join(oldPath, dbFileName), newPath)
                connectSqlite3(newPath)
              }
              return { path: filePaths[0], change: true }
            }
            else {
              return { path: oldPath, change: false }
            }
          }
          catch (e) {
            return false
          }
        }
        return false
      }
      case 'pin': { // 窗口置顶
        try {
          const { status } = apiData
          await global.win?.setAlwaysOnTop(status)
          const isTop = global.win ? global.win.isAlwaysOnTop() : false

          const setRes = setStore('app.isTop', isTop)
          if (setRes) {
            sendToRendererNew('store', {
              isTop,
            })
          }
          return true
        }
        catch (e) {
          return false
        }
      }
      case 'close-app': { // 关闭应用
        app.quit()
        process.exit(0)
        return true
      }
      case 'hide-app': { // 隐藏应用
        global.win?.hide()
        return true
      }
      case 'module-info': { // 模块信息
        try {
          const { module } = apiData
          return await getConfigByKey(`${module}_module`)
        }
        catch (e) {
          return false
        }
      }
      case 'info-list': { // Info 列表查询
        try {
          const { type = 'v2ex', page = 1, pageSize = 10 } = apiData
          return await infoList(type, page, pageSize)
        }
        catch (e) {
          return null
        }
      }
      case 'open-new-window': { // 新窗口打开网址
        try {
          const { url } = apiData
          const res = await viewWindowInit(url, true, true)
          if (res) {
            const { name } = res
            global.wins?.[name]?.show()
          }
          return true
        }
        catch (e) {
          return false
        }
      }
      case 'schedule-list': { // 定时任务列表
        try {
          return await schedule.list()
        }
        catch (e) {
          return null
        }
      }
      case 'log-list': { // 日志列表
        try {
          const { type = 'v2ex-schedule', page = 1, pageSize = 10 } = apiData
          return await logList(type, page, pageSize)
        }
        catch (e) {
          return null
        }
      }
      default:
        // eslint-disable-next-line no-console
        console.log('>>>>default:', name)
        break
    }
  })
}

export { sendToRenderer, messageInit }
