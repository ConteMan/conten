import { ipcMain } from 'electron'
import { API } from '@main/constants/index'

import Subject from '@main/modules/subject'
import { pinTop } from '@main/app/windows'
import Store from './store'

export function ipcApiInit() {
  ipcMain.handle('api', async (_event, data) => {
    const { name, args } = data

    if (!name)
      return false

    const apiMap = new Map([
      // 条目
      [API.SUBJECT_LIST, Subject.list(args)],
      [API.SUBJECT_TYPES, Subject.types()],
      [API.SUBJECT_STATUSES, Subject.statuses()],
    ] as Iterable<[string, any]>)

    if (apiMap.has(name))
      return await apiMap.get(name)

    // 窗口
    if (name === API.WINDOW_PIN_TOP)
      return pinTop(args)

    // 获取应用配置
    if (name === API.GET_STORE) {
      const { key } = args
      return Store.getConf(key)
    }

    return false
  })
}
