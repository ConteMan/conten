import type http from 'http'
import koa from 'koa'
import { PrismaClient } from '@prisma/client'

class Server {
  public app: koa
  public server: http.Server | null
  public prisma: PrismaClient

  constructor() {
    this.app = new koa()
    this.server = null
    this.prisma = new PrismaClient()
  }
  
  async findUser() {
    return await this.prisma.user.findMany()
  }

  async start(port = '3000') {
    await this.prisma.$connect()
    this.app.use(async (ctx, next) => {
      ctx.body = await this.findUser()
    })
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
