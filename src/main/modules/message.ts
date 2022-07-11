import path from 'path'
import { app, dialog, ipcMain } from 'electron'

import fs from 'fs-extra'
import { isString } from 'lodash'
import { sendToRenderer } from '@main/utils/ipcMessage'
import { restart as KoaRestart, start as koaStart, stop as koaStop } from '@main/server/koa'
import { getStore, getStorePath, setStore, setStorePath, storeInit } from '@main/modules/store'
import { connectSqlite3, reconnectMongoDB } from '@main/modules/db'
import { getWeather } from '@main/services/weather'
import { getConfigByKey, getConfigsByGroup, getConfigsByKeys, moduleEnable, setConfig } from '@main/services/config'
import { getPackageInfo } from '@main/services/package'
import { viewWindowInit } from '@main/modules/window'
import { checkIn as JuejinCheckIn } from '@main/services/juejin'

import WakaTime from '@main/services/wakatime'
import TapTap from '@main/services/taptap'
import { action as infoAction, list as infoList } from '@main/services/info'
import Schedule from '@main/services/schedule'
import { logList } from '@main/services/log'
import type { DoubanHtmlRequest } from '@main/services/douban'
import Douban from '@main/services/douban'
import Subject from '@main/services/subject'
import { checkShortcut, resetShortcut } from '@main/modules/shortcuts'
import V2ex from '@main/services/v2ex'
import System from '@main/services/system'
import Dom from '@main/services/dom'
import Info from '@main/services/info/index'
import ScheduleSetting from '@main/services/schedule/index'

/**
 * 消息监听服务初始化
 */
async function messageInit() {
  ipcMain.handle('api', async (event, data) => {
    if (isString(data))
      data = JSON.parse(data)

    const { name, data: apiData } = data

    // eslint-disable-next-line no-console
    console.log('>>> modules >> message > api', name, apiData)

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
        return await TapTap.detail(refresh ?? false)
      }
      case 'module-enable': { // 模块是否开启
        const { module } = apiData
        return await moduleEnable(module)
      }
      case 'configs': { // 根据分组获取配置
        try {
          const { group_key } = apiData
          return await getConfigsByGroup(group_key)
        }
        catch (e) {
          return false
        }
      }
      case 'configs-by-keys': { // 根据 key 数组获取配置
        try {
          const { keys } = apiData
          // eslint-disable-next-line no-console
          console.log('>>> keys >>', keys)
          return await getConfigsByKeys(keys)
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
      case 'get-config-stores': { // 批量获取 store 配置
        try {
          const { keys } = apiData
          const defaultStore = getStore()
          if (!defaultStore)
            return false

          const values: any = {}
          keys.forEach((key: string) => {
            const res = defaultStore.get(key, false) as any
            values[key] = res
          })

          return values
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
              sendToRenderer('store', {
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
      case 'set-config-stores': { // 批量保存配置到 store
        try {
          const { data } = apiData
          const dealData = JSON.parse(data)
          // eslint-disable-next-line no-console
          console.log('>>>>> data:', dealData)
          const keys = Object.keys(dealData)
          keys.forEach((key: string) => {
            const setRes = setStore(key, dealData[key])
            if (setRes) {
              if (key === 'server.port') {
                if (global.koaApp)
                  KoaRestart(dealData[key])
              }
              if (key === 'db.mongodb') {
                const newDBUrl = dealData[key]?.[0].url
                if (newDBUrl)
                  reconnectMongoDB()
              }
            }
          })
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
            sendToRenderer('store', {
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
          const { module, refresh = false } = apiData
          if (refresh) {
            if (module === 'v2ex')
              await V2ex.schedule()
          }
          return await getConfigByKey(`${module}_module`)
        }
        catch (e) {
          return false
        }
      }
      case 'info-list': { // 资讯列表
        try {
          const { type = 'v2ex,sspai', page = 1, pageSize = 10 } = apiData
          return await infoList(type, page, pageSize)
        }
        catch (e) {
          return null
        }
      }
      case 'info-action': { // 资讯操作
        try {
          const { action, id } = apiData
          return await infoAction(action, id)
        }
        catch (e) {
          return false
        }
      }
      case 'info-schedule': { // 资讯同步
        try {
          return await Info.schedule()
        }
        catch (e) {
          return false
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
          return await Schedule.list()
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
      case 'douban': { // 豆瓣
        try {
          const { type = 'html', data } = apiData
          if (type === 'book') {
            return await Douban.data('book', data)
          }
          else if (type === 'book-list') {
            const doubanIdKey = 'douban_id'
            const doubanIdRes = await getConfigByKey(doubanIdKey)
            if (!doubanIdRes)
              return false

            const params: DoubanHtmlRequest = {
              id: doubanIdRes.value,
              type: 'book',
              status: 'collect',
              start: 0,
            }
            return await Douban.list(params)
          }
          else {
            return await Douban.movieSearch(data)
          }
        }
        catch (e) {
          return null
        }
      }
      case 'subject': { // 条目接口
        try {
          const { method = 'list', params = {} } = apiData
          if (method === 'list') {
            const { type = 'movie', status = 'do', page = 1, pageSize = 20 } = params
            return await Subject.list(type, status, page, pageSize)
          }
          return false
        }
        catch (e) {
          return false
        }
      }
      case 'subject-list': { // 条目列表
        try {
          const { type = 'movie', status = 'do', page = 1, pageSize = 20 } = apiData
          return await Subject.list(type, status, page, pageSize)
        }
        catch (e) {
          return []
        }
      }
      case 'check-shortcut': { // 校验快捷键是否可用
        try {
          const { name, shortcut } = apiData
          return checkShortcut(name, shortcut)
        }
        catch (e) {
          return false
        }
      }
      case 'save-shortcut': { // 保存快捷键
        try {
          const { name, shortcut } = apiData
          const resetRes = await resetShortcut(name, shortcut)
          if (resetRes) {
            const saveData = {
              group_key: 'shortcut',
              key: name,
              value: shortcut,
            }
            return !!await setConfig(saveData)
          }
          return false
        }
        catch (e) {
          return false
        }
      }
      case 'test-proxy': { // 测试代理
        try {
          const { protocol, host, port } = apiData
          return await System.testProxy(protocol, host, port)
        }
        catch (e) {
          return false
        }
      }
      case 'dom': { // Dom 服务
        try {
          return await Dom.list('libvio', { type: 'film' })
        }
        catch (e) {
          return false
        }
      }
      case 'koa': { // Koa 服务
        try {
          const { action } = apiData
          if (action === 'start')
            return await koaStart()
          else
            return await koaStop()
        }
        catch (e) {
          return false
        }
      }
      case 'package-info': { // 应用使用的库信息
        try {
          return getPackageInfo()
        }
        catch (e) {
          return false
        }
      }
      case 'schedule-setting-list': { // 定时任务设置列表
        try {
          return ScheduleSetting.list()
        }
        catch (e) {
          return false
        }
      }
      case 'schedule-setting-init': { // 定时任务设置初始化
        try {
          return ScheduleSetting.init()
        }
        catch (e) {
          return false
        }
      }
      case 'schedule-setting-save': { // 定时任务设置保存
        try {
          const { id, data } = apiData
          return ScheduleSetting.save(id, data)
        }
        catch (e) {
          return false
        }
      }
      case 'schedule-run': { // 根据 Key 执行定时任务
        try {
          const { key } = apiData
          if (!key)
            return false
          return await Schedule.scheduleByKey(key)
        }
        catch (e) {
          return false
        }
      }
      default:
        // eslint-disable-next-line no-console
        console.log('>>> message >> messageInit > default:', name)
        break
    }
  })
}

export { messageInit }
