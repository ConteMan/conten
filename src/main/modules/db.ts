import type { DB } from '~/main/config'
import { getStore } from '~/main/store'
import { MongoClient } from 'mongodb'
import { sendToRenderer } from '~/main/modules/message'

export function dbInit() {
  return connectMongoDB()
}

export function connectMongoDB(url: string = '') {
  const store = getStore()
  if (!url) {
    const dbArray: DB[] = store.get('db.mongodb', [])
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
  } catch (error) {
    sendToRenderer('error', error)
    return false
  }
  return true
}

export async function getMongoClient() {
  return await global.mongoClient
}
