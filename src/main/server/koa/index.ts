import type http from 'http'
import koa from 'koa'
import koaBody from 'koa-body'
import { MongoClient } from 'mongodb'

import { sendRendererMessage } from '~/main/modules/message'
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



  async start(port: number | string | undefined = undefined) {
    if (!port) {
      port = await this.store?.get('server.port', 3333) as number
    }

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
