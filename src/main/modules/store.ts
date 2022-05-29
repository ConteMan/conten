import { app } from 'electron'
import Store from 'electron-store'
import _ from 'lodash'

import { CONFIG } from '@main/config'
import { ConfigEnum } from '@main/enums/configEnum'

/**
 * 配置文件初始化
 * @param name - 配置文件名称
 * @param reload - 是否重新加载
 * @param overwrite - 是否覆盖原有配置
 * @param reset - 是否重置（清空再设置）
 */
export function storeInit(name: ConfigEnum = ConfigEnum.DEFAULT_NAME, reload = false, overwrite = false, reset = false) {
  try {
    const cwd = getStorePath(name)

    if (!global.store)
      global.store = { [name]: new Store({ name, cwd, clearInvalidConfig: false }) }

    if (!global.store[name] || reload)
      global.store[name] = new Store({ name, cwd, clearInvalidConfig: false })

    if (reset)
      global.store[name].clear()

    if (!global.store[name].size || overwrite) {
      global.store[name].set(CONFIG[name] as object)
    }
    else {
      const mergeConfig = _.merge({}, { ...CONFIG[name] }, global.store[name].store)
      global.store[name].set(mergeConfig)
    }
    return global.store[name]
  }
  catch (e) {
    // eslint-disable-next-line no-console
    console.log(e)
    return false
  }
}

/**
 * 获取配置 Electron-store 对象
 * @param name - 配置文件名称
 */
export function getStore(name = ConfigEnum.DEFAULT_NAME) {
  if (!global.store || !global.store[name])
    return storeInit(name)
  else
    return global.store[name]
}

/**
 * 获取配置详情
 * @param name - 配置文件名称
 */
export function getStoreDetail(name = ConfigEnum.DEFAULT_NAME) {
  if (!global.store || !global.store[name]) {
    const res = storeInit(name)
    return res ? res.store : false
  }
  else {
    return global.store[name].store
  }
}

/**
 * 设置配置数据
 * @param name - 配置文件名称
 * @param data - 配置数据
 */
export function setStore(key = '', value: string | boolean = '', name = ConfigEnum.DEFAULT_NAME) {
  try {
    if (key) {
      global.store?.[name].set(key, value)
      return true
    }
    return false
  }
  catch (e) {
    // eslint-disable-next-line no-console
    console.log(e)
    return false
  }
}

/**
 * 应用默认配置文件（不可更改位置）
 */
export async function appStoreInit() {
  const appStore = new Store({ name: 'contea', clearInvalidConfig: false })
  if (!appStore.size)
    appStore.set('defaultPath', app.getPath('userData'))
  global.appStore = appStore
  return global.appStore
}

/**
 * 获取配置文件路径
 * @param storeName - 配置文件名称
 */
export function getStorePath(storeName = ConfigEnum.DEFAULT_NAME) {
  if (!global.appStore)
    appStoreInit()
  return global.appStore.get(`${storeName}Path`)
}

/**
 * 设置配置文件路径
 * @param storeName - 配置文件名称
 * @param path - 路径
 */
export function setStorePath(storeName = ConfigEnum.DEFAULT_NAME, path = '') {
  if (!global.appStore)
    appStoreInit()
  if (path)
    global.appStore.set(`${storeName}Path`, path)
  return global.appStore.get(`${storeName}Path`)
}
