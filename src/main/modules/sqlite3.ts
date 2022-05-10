import path from 'path'
import { app } from 'electron'
import { Sequelize } from 'sequelize'

const dbPath = path.join(app.getPath('userData'), 'sqlite3.db')

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
})

global.sequelize = sequelize
