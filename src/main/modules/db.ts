import path from 'path'
import { app } from 'electron'
import { MongoClient } from 'mongodb'
import { Sequelize } from 'sequelize'
import type { DB } from '~/main/config'
import { getStore } from '~/main/modules/store'
import { sendToRenderer } from '~/main/modules/message'

import RequestCacheModel from '~/main/models/requestCache'
import ConfigModel from '~/main/models/config'
import { dbDefault } from '~/main/config/db'

/**
 * 数据库初始化
 */
export async function dbInit() {
  await sqlite3Init()
  return true
}

export async function connectMongoDB(url = '') {
  const store = getStore()
  if (!store) {
    sendToRenderer('error', 'NO AVAILABLE DB 1')
    return false
  }

  if (!url) {
    const dbArray = store.get('db.mongodb', []) as DB[]
    if (dbArray.length) {
      const selectedDB = dbArray.find((item: DB) => item.selected)
      url = selectedDB?.url || ''
    }
  }
  if (!url) {
    sendToRenderer('error', 'NO AVAILABLE DB')
    return false
  }
  try {
    global.mongoClient = new MongoClient(url)
    global.mongoClient.connect()

    // eslint-disable-next-line no-console
    console.log('Connected to MongoDB!')
  }
  catch (error) {
    sendToRenderer('error', error)
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
    sendToRenderer('success', 'Reconnected to MongoDB!')
    return true
  }
  catch (e) {
    sendToRenderer('error', e)
    return false
  }
}

export function connectSqlite3(dbPath = '') {
  try {
    if (!dbPath)
      dbPath = path.join(app.getPath('userData'), 'sqlite3.db')

    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: dbPath,
    })

    global.sequelize = sequelize
    return true
  }
  catch (e) {
    // eslint-disable-next-line no-console
    console.log('connectSqlite3', e)
    return false
  }
}

/**
 * SQLite3 初始化
 */
async function sqlite3Init() {
  await RequestCacheModel.sync()
  await ConfigModel.sync()

  await dbDefault() // 配置文件同步到 SQLite3 数据库
}
