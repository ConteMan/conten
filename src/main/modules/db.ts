import type { DB } from '~/main/config'
import { getStore } from '~/main/store'
import { MongoClient } from 'mongodb'
import { sendToRenderer } from '~/main/modules/message'

export function dbInit() {
  return connectMongoDB()
}

export async function connectMongoDB(url: string = '') {
  const store = await getStore()
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

export async function reconnect() {
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
