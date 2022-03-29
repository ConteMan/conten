import Store from 'electron-store'
import defaultConfig from '../config/default.json'

const store: any = {}

export function init(name: 'config') {
  if (!store[name]) {
    store[name] = new Store({name, clearInvalidConfig: false})
    if (!store[name].size) {
      store[name].store = defaultConfig
    }
  }
  return store[name]
}

export default store