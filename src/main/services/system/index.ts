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
}

export default new System()
