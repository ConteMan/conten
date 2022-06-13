import path from 'path'
import { app } from 'electron'
import { MongoClient } from 'mongodb'
import { Sequelize } from 'sequelize'
import { getStore } from '@main/modules/store'

import RequestCacheModel from '@main/models/requestCache'
import ConfigModel from '@main/models/config'
import TaskModel from '@main/models/task'
import InfoModel from '@main/models/info'
import LogModel from '@main/models/log'
import Migration from '@main/models/migration'
import Subject from '@main/models/subject'
import { migrate } from '@main/migrations'

/**
 * 数据库初始化
 */
export async function dbInit() {
  await sqlite3Init()
  await migrate()
}

/**
 * SQLite3 初始化
 */
async function sqlite3Init() {
  try {
    await RequestCacheModel.sync()
    await ConfigModel.sync()
    await TaskModel.sync()
    await InfoModel.sync()
    await LogModel.sync()
    await Migration.sync()
    await Subject.sync()
  }
  catch (e) {
    // eslint-disable-next-line no-console
    console.log('>>> Log >> sqlite3Init', e)
  }
}

/**
 * 连接 SQLite3
 * @param dbPath - db 文件地址
 */
export function connectSqlite3(dbPath = '') {
  try {
    if (!dbPath)
      dbPath = path.join(app.getPath('userData'), 'sqlite3.db')

    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: dbPath,
    })

    global.sequelize = sequelize

    // eslint-disable-next-line no-console
    console.log('>>> sqlite2Init connectSqlite3')

    return true
  }
  catch (e) {
    // eslint-disable-next-line no-console
    console.log('connectSqlite3', e)
    return false
  }
}

export async function connectMongoDB(url = '') {
  const store = getStore()
  if (!store)
    return false

  if (!url) {
    const dbArray = store.get('db.mongodb', []) as Contea.DB[]
    if (dbArray.length) {
      const selectedDB = dbArray.find((item: Contea.DB) => item.selected)
      url = selectedDB?.url || ''
    }
  }
  if (!url)
    return false

  try {
    global.mongoClient = new MongoClient(url)
    global.mongoClient.connect()

    // eslint-disable-next-line no-console
    console.log('Connected to MongoDB!')
  }
  catch (error) {
    return false
  }
  return true
}

export async function getMongoClient() {
  return global.mongoClient
}

export async function reconnectMongoDB() {
  try {
    await global.mongoClient?.close()
    await connectMongoDB()
    return true
  }
  catch (e) {
    return false
  }
}
