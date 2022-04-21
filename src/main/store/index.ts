import Store from 'electron-store'
import { config } from '../config'
import { ConfigEnum } from '../config/enum'

export function init(name: ConfigEnum = ConfigEnum.DEFAULT_NAME, overwrite = false) {
  try {
    if (!global.store) {
      global.store = { [name]: new Store({name, clearInvalidConfig: false}) }
    }
    if (!global.store[name]) {
      global.store[name] = new Store({name, clearInvalidConfig: false})
    }
    if (!global.store[name].size) {
      global.store[name].set(JSON.stringify(config[name]))
    } else {
      if (overwrite) {
        global.store[name].clear()
      }
    }
    return global.store[name]
  }
  catch(e) {
    console.log(e)
    return false
  }
}

export function getStore(name = ConfigEnum.DEFAULT_NAME) {
  if (!global.store || !global.store[name]) {
    return init(name)
  } else {
    return global.store[name]
  }
}

export function getStoreDetail(name = ConfigEnum.DEFAULT_NAME) {
  if (!global.store || !global.store[name]) {
    const res = init(name)
    return res ? res.store : false
  } else {
    return global.store[name].store
  }
}