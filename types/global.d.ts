import type { BrowserWindow } from 'electron'
import type ElectronStore from 'electron-store'
import type { MongoClient } from 'mongodb'
import type { Sequelize } from 'sequelize/types'
import type koa from 'koa'
import type http from 'http'
import type { Socket } from 'net'

declare global {
  var win: BrowserWindow | null
  var store: Record<string, ElectronStore> | null
  var mongoClient: MongoClient | null
  var sequelize: Sequelize
  var koaApp: koa | null
  var server: http.Server | null
  var serverSockets: Set<Socket>
}
