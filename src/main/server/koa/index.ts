import type { Socket } from 'net'
import net from 'net'
import Koa from 'koa'
import koaBody from 'koa-body'

import { getStore } from '@main/modules/store'
import router from './router'

/**
 * 启动服务
 * @param port - 端口
 */
async function start(port: string | undefined = undefined) {
  try {
    const koaApp = new Koa()

    const store = getStore()
    if (store && !port)
      port = await store.get('server.port') as string

    if (!port)
      return false

    const enablePort = await portIsOccupied(port)
    if (enablePort !== port)
      return false

    koaApp.use(koaBody())
    koaApp.use(router.routes())
      .use(router.allowedMethods())

    const koaServer = koaApp.listen(port)

    koaServer.on('connection', (socket) => {
      if (!global.serverSockets)
        global.serverSockets = new Set()

      global.serverSockets.add(socket)
      socket.on('close', () => {
        global.serverSockets.delete(socket)
      })
    })
    koaServer.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.log('>>> Koa index >> start listen', err)
    })

    global.koaApp = koaApp
    global.server = koaServer
    return true
  }
  catch (e) {
    // eslint-disable-next-line no-console
    console.log('>>> Koa index >> start', e)
    return false
  }
}

/**
 * 关闭服务
 */
async function stop() {
  if (global.server) {
    try {
      destroySockets(global.serverSockets)
      await global.server?.close(() => {
        global.server = null
      })
      global.koaApp = null
      return true
    }
    catch (e) {
      return false
    }
  }
  else {
    return false
  }
}

/**
 * 重启服务
 * @param port - 端口号
 */
async function restart(port: string) {
  await stop()
  await start(port)
}

/**
 * 销毁 Socket 连接
 * @param sockets - Socket 连接 Set
 */
function destroySockets(sockets: Set<Socket>) {
  if (!sockets || sockets.size <= 0)
    return
  for (const socket of sockets.values())
    socket.destroy()
}

/**
 * 端口占用检测
 * @param port - 端口
 */
async function portIsOccupied(port: string) {
  const server = net.createServer().listen(port)
  return new Promise((resolve, reject) => {
    server.on('listening', () => {
      // eslint-disable-next-line no-console
      console.log(`>>> Koa index >> portIsOccupied: the server is running on port ${port}`)
      server.close()
      resolve(port)
    })

    server.on('error', (err) => {
      reject(err)
    })
  })
}

export { start, stop, restart, portIsOccupied }
