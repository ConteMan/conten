import { getStore } from '~/main/store'
import { MongoClient } from 'mongodb'
import { sendRendererMessage } from '~/main/modules/message'

export function connectMongoDB(url: string = '') {
  const store = getStore()
  if (!url)
    url = store.get('db.mongodb.url', '')
  if (!url) {
    sendRendererMessage('error', 'MongoDB url is empty')
    return false
  }
  try {
    global.mongoClient = new MongoClient(url);
    global.mongoClient.connect()
  } catch (error) {
    sendRendererMessage('error', error)
    return false
  }
  return true
}