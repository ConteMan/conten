import type { DB } from '~/main/config'
import { app } from 'electron'
import path from 'path'
import { MongoClient } from 'mongodb'
import { getStore } from '~/main/store'
import { sendToRenderer } from '~/main/modules/message'
import { Sequelize } from 'sequelize'

import RequestCacheModel from '~/main/models/requestCache'

export async function dbInit() {
  // connectSqlite3()
  // connectMongoDB()
  await sqlite3Init()
  return true
}

export async function connectMongoDB(url: string = '') {
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
    global.mongoClient = new MongoClient(url);
    global.mongoClient.connect()
    console.log('Connected to MongoDB!')
  } catch (error) {
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
  catch(e) {
    sendToRenderer('error', e)
    return false
  }
}

export function connectSqlite3(dbPath: string = '') {
  try {
    if(!dbPath)
      dbPath = path.join(app.getPath('userData'), 'sqlite3.db')
    
    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: dbPath,
    });
    
    global.sequelize = sequelize
    return true
  }
  catch(e) {
    console.log('connectSqlite3', e)
    return false
  }
}

async function sqlite3Init() {
  await RequestCacheModel.sync()
}
