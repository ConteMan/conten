import Subject from '@main/modules/subject'
import { ipcMain } from 'electron'

export function ipcApiInit() {
  ipcMain.handle('api', async (_event, data) => {
    const { name, args = undefined } = data

    const api = {
      // 条目
      subjectList: Subject.list(args),
      subjectTypes: Subject.types(),
      subjectStatuses: Subject.statuses(),
    }

    if (api[name])
      return await api[name]

    return false
  })
}
