import Subject from '@main/modules/subject'
import { ipcMain } from 'electron'

export function ipcApiInit() {
  ipcMain.handle('api', async (_event, data) => {
    const { name, args } = data

    if (!name)
      return false

    // 条目
    const subjectApi = [
      ['subjectList', Subject.list(args)],
      ['subjectTypes', Subject.types()],
      ['subjectStatuses', Subject.statuses()],
    ]

    const apiMap = new Map([
      ...subjectApi,
    ] as Iterable<[string, any]>)

    if (apiMap.has(name))
      return await apiMap.get(name)

    return false
  })
}
