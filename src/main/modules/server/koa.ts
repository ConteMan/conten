import type http from 'http'
import koa from 'koa'

class Server {
  public app: koa
  public server: http.Server | null

  constructor() {
    this.app = new koa()
    this.server = null
  }

  async start() {
    this.app.use(async (ctx, next) => {
      ctx.body = 'Hello World'
    })
    this.server = this.app.listen(3000)

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
