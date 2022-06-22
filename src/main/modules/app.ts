import { app } from 'electron'
import { getStore } from '@main/modules/store'
import { start } from '@main/server/koa'

/**
 * 应用初始化
 */
export function appInit() {
  const configStore = getStore()
  if (!configStore)
    return false

  const appName = configStore.get('app.name') as string
  app.setName(appName)

  const serverStart = configStore.get('server.autoStart') as boolean
  if (serverStart)
    start()
}
