import process from 'process'
import { app } from 'electron'
import { checkTask } from '@main/services/task'
import type { Axios as AxiosType } from 'axios'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Axios: AxiosType = require('axios').default

class System {
  /**
 * 定时任务
 */
  async schedule() {
    await checkTask()
    await this.relaunchByMemory()
    return true
  }

  /**
   * 测试代理
   * @param protocol - 协议
   * @param host - 主机
   * @param port - 端口
   */
  async testProxy(protocol: string, host: string, port: string) {
    try {
      if (!protocol || !host || !port)
        return false

      const url = 'https://www.google.com'
      const res = await Axios.get(url, {
        proxy: {
          protocol,
          host,
          port: parseInt(port),
        },
      })
      return res.status === 200
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log('>>> services >> system >> testProxy', e)
      return false
    }
  }

  /**
   * 获取应用自身信息
   */
  async info() {
    try {
      return {
        metrics: app.getAppMetrics(),
        creationTime: process.getCreationTime(),
        cpu: process.getCPUUsage(),
        memory: await process.getProcessMemoryInfo(),
        version: process.getSystemVersion(),
      }
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log('>>> services >> system >> info', e)
      return false
    }
  }

  /**
   * 内存超出限定后，重启应用
   */
  async relaunchByMemory() {
    try {
      const limitMemory = 200
      const memory = await process.getProcessMemoryInfo()
      // eslint-disable-next-line no-console
      console.log('>>> services >> system >> relaunchByMemory', memory.private > limitMemory * 1024)
      if (memory.private > limitMemory * 1024) {
        app.relaunch()
        app.exit() // 立即退出
        // app.quit() // 平滑退出
      }
      return true
    }
    catch (e) {
      return false
    }
  }
}

export default new System()
