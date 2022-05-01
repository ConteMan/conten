import { app } from 'electron'
import path from 'path'
const { Sequelize } = require('sequelize')

const dbPath = path.join(app.getPath('userData'), 'sqlite3.db')

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
});

global.sequelize = sequelize

console.log('>>> sequelize')