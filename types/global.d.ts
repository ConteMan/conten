import type { BrowserWindow } from 'electron'
import type ElectronStore from 'electron-store'
import { MongoClient } from 'mongodb'

declare global {
  var win: BrowserWindow | null
  var mongoClient: MongoClient | null
  var store: Record<string, Record<string, any>> | null
}