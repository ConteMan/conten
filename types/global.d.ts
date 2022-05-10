/* eslint-disable no-var,vars-on-top */

import type http from 'http'
import type { Socket } from 'net'
import type { BrowserView, BrowserWindow } from 'electron'
import type ElectronStore from 'electron-store'
import type { MongoClient } from 'mongodb'
import type { Sequelize } from 'sequelize/types'
import type koa from 'koa'

declare global {
  var win: BrowserWindow | null
  var wins: Record<string, BrowserWindow>
  var views: Record<string, BrowserView>
  var store: Record<string, ElectronStore> | null
  var mongoClient: MongoClient | null
  var sequelize: Sequelize
  var koaApp: koa | null
  var server: http.Server | null
  var serverSockets: Set<Socket>
}
