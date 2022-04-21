import { app, ipcMain } from 'electron'
import path from 'path'
const { Sequelize } = require('sequelize')

const dbPath = path.join(app.getPath('userData'), 'sqlite3.db')

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
});

global.sequelize = sequelize

ipcMain.handle('sqlite3', async event => {
  try {
    await sequelize.authenticate();
    return JSON.stringify([null, 1])
  } catch (error: any) {
    return JSON.stringify([error.message, null])
  }
})
