import type http from 'http'
import koa from 'koa'
import koaBody from 'koa-body'

import router from './router'

import { PrismaClient } from '@prisma/client'

class Server {
  public app: koa
  public server: http.Server | null

  constructor() {
    this.app = new koa()
    this.server = null
    global.prisma = new PrismaClient()
  }

  async start(port = '3000') {
    await global.prisma?.$connect()

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
