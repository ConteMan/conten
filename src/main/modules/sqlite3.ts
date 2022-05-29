import path from 'path'
import { app } from 'electron'
import { Sequelize } from 'sequelize'
import { getStore } from '@main/modules/store'

const defaultStore = getStore()
const dbPathDir = defaultStore ? defaultStore.get('db.sqlite3.path', app.getPath('userData')) as string : app.getPath('userData')
const dbPath = path.join(dbPathDir, 'sqlite3.db')

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
})

global.sequelize = sequelize
