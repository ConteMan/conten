import * as path from 'node:path'
import { app } from 'electron'
import { Sequelize } from 'sequelize'
import Store from '@main/app/store'

export const CONFIG = {
  key: {
    root: 'db',
    sqlite3: 'db.sqlite3',
    sqlite3_path: 'db.sqlite3.path',
  },
  sqlite3_file_name: 'sqlite3.db',
}

export enum DBType {
  SQLITE3 = 'sqlite3',
}

class DB {
  private static instance: DB
  private DBMap = new Map<string, Sequelize>()

  constructor() {
    if (DB.instance)
      return DB.instance

    this.init()

    DB.instance = this
    return DB.instance
  }

  async init() {
    await this.initSqlite3()
  }

  getDB(type = DBType.SQLITE3) {
    // 保证初始化后再获取
    return this.DBMap.get(type) as Sequelize
  }

  async initSqlite3() {
    this.sqlite3Connect()
  }

  sqlite3Connect() {
    try {
      const store = Store.getStore()
      if (!store)
        return false

      const pathDir = store.get(CONFIG.key.sqlite3_path) as string | undefined ?? app.getPath('userData')
      if (!pathDir)
        return false

      const dbPath = path.join(pathDir, CONFIG.sqlite3_file_name)
      const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: dbPath,
      })

      // eslint-disable-next-line no-console
      console.log('[ sequelize connect ] >', dbPath, true)

      return this.DBMap.set(DBType.SQLITE3, sequelize)
    }
    catch (e) {
      return false
    }
  }
}

export default new DB()
