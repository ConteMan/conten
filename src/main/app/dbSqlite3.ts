import RequestCacheModel from '../models/requestCache'
import ConfigModel from '../models/config'
import TaskModel from '../models/task'
import InfoModel from '../models/info'
import LogModel from '../models/log'
import Migration from '../models/migration'
import Subject from '../models/subject'
import Schedule from '../models/schedule'

import DB, { DBType } from './db'

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
