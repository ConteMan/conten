import type { Socket } from 'node:net'
import type { Server } from 'node:http'
import net from 'node:net'
import Koa from 'koa'
import { koaBody } from 'koa-body'
import Store from '@main/app/store'
import { ServerStoreKey } from '@constants/index'
import router from './router'

class KoaServer {
  private static instance: KoaServer
  private ServerAppMap = new Map<string, Koa>()
  private ServerMap = new Map<string, Server>()
  private ServerSocketMap = new Map<string, Set<Socket>>()

  constructor() {
    if (KoaServer.instance)
      return KoaServer.instance

    KoaServer.instance = this
    return KoaServer.instance
  }

  /**
   * 启动服务
   * @param port - 端口
   */
  async start(port = '') {
    try {
      const koaApp = new Koa()

      const store = Store.getStore()
      if (store && !port)
        port = await store.get(ServerStoreKey.PORT) as string

      if (!port)
        return false

      const enablePort = await this.portIsOccupied(port)
      if (enablePort !== port)
        return false

      koaApp.use(koaBody())
      koaApp.use(router.routes())
        .use(router.allowedMethods())

      const koaServer = koaApp.listen(port)

      koaServer.on('connection', (socket) => {
        const current = this.ServerSocketMap.get(port) ?? new Set()
        current.add(socket)
        this.ServerSocketMap.set(port, current)
        socket.on('close', () => {
          const current = this.ServerSocketMap.get(port)
          if (current && current.has(socket)) {
            current.delete(socket)
            this.ServerSocketMap.set(port, current)
          }
        })
      })
      koaServer.on('error', (err) => {
        // eslint-disable-next-line no-console
        console.log('>>> Koa index >> start listen', err)
      })

      this.ServerAppMap.set(port, koaApp)
      this.ServerMap.set(port, koaServer)
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
  async stop(port = '') {
    const portSockets = this.ServerSocketMap.get(port)
    if (portSockets) {
      this.destroySockets(portSockets)
      this.ServerSocketMap.delete(port)
    }

    const portServer = this.ServerMap.get(port)
    if (portServer) {
      portServer.close(() => {
        this.ServerMap.delete(port)
      })
    }

    if (this.ServerAppMap.has(port))
      this.ServerAppMap.delete(port)

    return true
  }

  /**
   * 重启服务
   * @param port - 端口号
   */
  async restart(port: string) {
    await this.stop(port)
    await this.start(port)
  }

  /**
   * 销毁 Socket 连接
   * @param sockets - Socket 连接 Set
   */
  destroySockets(sockets: Set<Socket>) {
    if (!sockets || sockets.size <= 0)
      return
    for (const socket of sockets.values())
      socket.destroy()
  }

  /**
   * 端口占用检测
   * @param port - 端口
   */
  async portIsOccupied(port: string) {
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
}

export default new KoaServer()
