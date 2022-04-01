import Store from 'electron-store'
import { config } from '../config'
import { ConfigEnum } from '../config/enum'

export async function init(name = ConfigEnum.DEFAULT_NAME, overwrite = false) {
  const defaults = config[name]
  if (!global.store) {
    global.store = { [name]: new Store({name, clearInvalidConfig: false, defaults}) }
  }
  if (!global.store[name]) {
    global.store[name] = new Store({name, clearInvalidConfig: false, defaults})
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

export function getStore(name = ConfigEnum.DEFAULT_NAME) {
  if (!global.store || !global.store[name]) {
    return init(name)
  } else {
    return global.store[name]
  }
}
