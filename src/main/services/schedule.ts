import NodeSchedule from 'node-schedule'

import { getConfigByKey } from '~/main/services/config'
import WakaTime from '~/main/services/wakatime'

class Schedule {
  /**
   * 根据模块处理定时任务
   * @param moduleName - 模块名称
   */
  async dealByModule(moduleName: string) {
    try {
      const scheduleEnable = await getConfigByKey(`${moduleName}_schedule_enable`)
      if (!scheduleEnable.value) {
        if (global.jobs?.[moduleName]) {
          global.jobs?.[moduleName].cancel()
          delete global.jobs?.[moduleName]
          return true
        }
        else {
          return true
        }
      }

      const schedule = await getConfigByKey(`${moduleName}_schedule`)
      if (!schedule.value)
        return false

      if (global.jobs?.[moduleName]) {
        global.jobs?.[moduleName].reschedule(schedule.value)
        return true
      }

      const job = NodeSchedule.scheduleJob(schedule.value, async () => {
        await this.moduleSchedule(moduleName)
      })
      global.jobs = {
        [moduleName]: job,
        ...global.jobs,
      }

      // eslint-disable-next-line no-console
      console.log('>>> schedule:', global.jobs)

      return true
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log(`>>> dealByModule error: ${e}`)
      return false
    }
  }

  /**
   * 根据模块对应定时任务
   * @param moduleName - 模块名称
   */
  async moduleSchedule(moduleName: string) {
    switch (moduleName) {
      case 'wakatime':
      default: {
        await WakaTime.schedule()
        break
      }
    }
  }

  /**
   * 初始化定时任务
   */
  async init() {
    const modules = [
      'wakatime',
    ]
    for (const moduleName of modules)
      await this.dealByModule(moduleName)
  }
}

export default new Schedule()
