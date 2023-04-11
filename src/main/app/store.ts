import { app } from 'electron'
import ElectronStore from 'electron-store'

/**
 * 配置文件名
 */
export enum StoreName {
  APP = 'contea',
  DEFAULT = 'default',
}

class Store {
  private static instance: Store
  private StoreMap = new Map<string, ElectronStore>()
  private DefaultPathKey = 'defaultPath'

  constructor() {
    if (Store.instance)
      return Store.instance

    this.init()

    Store.instance = this
    return Store.instance
  }

  init() {
    const appStore = new ElectronStore({ name: StoreName.APP, clearInvalidConfig: false })
    if (!appStore.size)
      appStore.set(this.DefaultPathKey, app.getPath('userData'))
    this.StoreMap.set(StoreName.APP, appStore)

    this.initDefault()

    // eslint-disable-next-line no-console
    console.log('[ store ] >', 'store init!', app.getPath('userData'))
  }

  /**
   * 初始化默认配置
   */
  initDefault() {
    // 获取默认配置的路径
    const cwd = this.getConf(this.DefaultPathKey, StoreName.APP) as string | undefined
    if (!cwd)
      return false

    const defaultStore = new ElectronStore({ name: StoreName.DEFAULT, cwd, clearInvalidConfig: false })
    this.StoreMap.set(StoreName.DEFAULT, defaultStore)
    return true
  }

  /**
   * 获取 Store 实例
   * @param storeName - Store 名称
   */
  getStore(storeName = StoreName.DEFAULT) {
    return this.StoreMap.get(storeName)
  }

  /**
   * 获取配置
   * @param key - 配置键名
   */
  getConf(key: string, storeName = StoreName.DEFAULT) {
    return this.StoreMap.get(storeName)?.get(key)
  }

  /**
   * 设置配置
   * @param key - 键名
   * @param value - 值
   */
  setConf(key: string, value: string, storeName = StoreName.DEFAULT) {
    const appStore = this.StoreMap.get(storeName)
    if (!appStore)
      return false
    return appStore.set(key, value)
  }
}

export default new Store()
