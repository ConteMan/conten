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
    // 初始化应用配置
    const appStore = new ElectronStore({ name: StoreName.APP, clearInvalidConfig: false })
    if (!appStore.size)
      appStore.set(this.DefaultPathKey, app.getPath('userData'))
    this.StoreMap.set(StoreName.APP, appStore)

    // 初始化默认配置
    this.initDefault()

    // eslint-disable-next-line no-console
    console.log('[ store ] >', 'store init!')
  }

  /**
   * 初始化默认配置
   */
  initDefault() {
    const cwd = this.getConf(this.DefaultPathKey, StoreName.APP) as string | false
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
    return this.StoreMap.get(storeName) ?? false
  }

  /**
   * 获取配置
   * @param key - 配置键名
   */
  getConf(key: string, storeName = StoreName.DEFAULT) {
    const appStore = this.StoreMap.get(storeName)
    if (!appStore)
      return false
    return appStore.get(key)
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
