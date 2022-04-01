import type http from 'http'
import koa from 'koa'
import koaBody from 'koa-body'
import { PrismaClient } from '@prisma/client'

import router from './router'
import { ConfigEnum } from '../../config/enum'
import { getStore } from '~/main/store'

class Server {
  public app: koa
  public server: http.Server | null
  private store: Record<string, any> | null

  constructor() {
    this.app = new koa()
    this.server = null
    this.store = getStore()
  }

  async initPrismaClient() {
    const url = await this.store?.get('db.mongodb.url', '')
    if (!url) {
      return false
    }

    global.prisma = new PrismaClient({
      datasources: {
        db: {
          url: url as string,
        },
      },
    })
    await global.prisma?.$connect()
    return true
  }

  async start(port: number | string | undefined = undefined) {
    if (!port) {
      port = await this.store?.get('server.port', 3333) as number
    }
    const isInitDB = await this.initPrismaClient()
    if (!isInitDB)
      return { app: null, server: null }

    this.app.use(koaBody())
    this.app.use(router.routes()).use(router.allowedMethods())

    this.server = this.app.listen(port)

    return { app: this.app, server: this.server }
  }

  async stop() {
    if (this.server) {
      return await this.server?.close()
    } else {
      return false
    }
  }
}

export default Server
