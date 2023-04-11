import RequestCacheModel from '@main/models/requestCache'
import ConfigModel from '@main/models/config'
import TaskModel from '@main/models/task'
import InfoModel from '@main/models/info'
import LogModel from '@main/models/log'
import Migration from '@main/models/migration'
import Subject from '@main/models/subject'
import Schedule from '@main/models/schedule'

import DB, { DBType } from '@main/app/db'

export async function sync() {
  try {
    // eslint-disable-next-line no-console
    console.log('[ sequelize sync ]')

    if (!DB.getDB(DBType.SQLITE3))
      return false

    await Promise.all([
      ConfigModel?.sync(),
      RequestCacheModel?.sync(),
      TaskModel?.sync(),
      InfoModel?.sync(),
      LogModel?.sync(),
      Migration?.sync(),
      Subject?.sync(),
      Schedule?.sync(),
    ])
    // eslint-disable-next-line no-console
    console.log('[ sequelize sync end ]')
    return true
  }
  catch (e) {
    // eslint-disable-next-line no-console
    console.log('>>> sqlite3Sync >> error', e)
    return false
  }
}
