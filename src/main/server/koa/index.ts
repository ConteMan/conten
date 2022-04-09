import type http from 'http'
import koa from 'koa'
import koaBody from 'koa-body'

import router from './router'
import { getStore } from '~/main/store'

let app: koa | null = null
let server: http.Server | null = null

async function start(port: number | string | undefined = undefined) {
  try {
    app = new koa()
  
    const store = getStore()
    if (!port) {
      port = await store?.get('server.port', 3333) as number
    }
  
    app.use(koaBody())
    app.use(router.routes()).use(router.allowedMethods())
  
    server = app.listen(port)
    return true
  }
  catch(e) {
    return false
  }
}

async function stop() {
  if (server) {
    console.log('server stop')
    try {
      await server?.close()
      return true
    }
    catch(e) {
      return false
    }
  } else {
    return false
  }
}


export { start, stop }
