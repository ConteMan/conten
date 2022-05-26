import NodeSchedule from 'node-schedule'

import { getConfigByKey } from '@main/services/config'
import WakaTime from '@main/services/wakatime'
import { schedule as weatherSchedule } from '@main/services/weather'
import TapTap from '@main/services/taptap'
import System from '@main/services/system'

class Schedule {
  /**
   * 根据模块处理定时任务
   * @param moduleName - 模块名称
   */
  async dealByModule(moduleName: string) {
    try {
      const moduleEnable = await getConfigByKey(`${moduleName}_enable`)
      const scheduleEnable = await getConfigByKey(`${moduleName}_schedule_enable`)
      const schedule = await getConfigByKey(`${moduleName}_schedule`)
      if (!scheduleEnable.value || !moduleEnable.value || !schedule.value) {
        if (global.jobs?.[moduleName]) {
          global.jobs?.[moduleName].cancel()
          delete global.jobs?.[moduleName]
          return true
        }
        else {
          return true
        }
      }

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
    switch (moduleName) { // TODO 不优雅
      case 'system': {
        await System.schedule()
        break
      }
      case 'weather': {
        await weatherSchedule()
        break
      }
      case 'wakatime':{
        await WakaTime.schedule()
        break
      }
      case 'taptap': {
        await TapTap.schedule()
        break
      }
      default: {
        // eslint-disable-next-line no-console
        console.log('>>> schedule: not find moduleName, check.')
        break
      }
    }
    return true
  }

  /**
   * 初始化定时任务
   */
  async init() {
    const modules = [
      'system',
      'wakatime',
      'weather',
      'taptap',
    ]
    for (const moduleName of modules) {
      await this.dealByModule(moduleName)
      await this.moduleSchedule(moduleName) // TODO 任务多会影响启动体验，可以考虑延迟处理
    }
  }
}

export default new Schedule()
