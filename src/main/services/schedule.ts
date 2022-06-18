import NodeSchedule from 'node-schedule'
import dayjs from 'dayjs'
import { sendToRenderer } from '@main/utils/ipcMessage'
import { MODULES } from '@main/enums/scheduleEnum'
import { getConfigByKey } from '@main/services/config'
import WakaTime from '@main/services/wakatime'
import { schedule as weatherSchedule } from '@main/services/weather'
import TapTap from '@main/services/taptap'
import System from '@main/services/system'
import V2ex from '@main/services/v2ex'

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
      console.log('>>> SCHEDULE >> dealByModule > error: ', e)
      return false
    }
  }

  /**
   * 根据模块对应定时任务
   * @param moduleName - 模块名称
   */
  async moduleSchedule(moduleName: string) {
    switch (moduleName) { // TODO 不优雅
      case MODULES.SYSTEM: {
        await System.schedule()
        break
      }
      case MODULES.WEATHER: {
        await weatherSchedule()
        break
      }
      case MODULES.WAKATIME:{
        await WakaTime.schedule()
        break
      }
      case MODULES.TAPTAP: {
        await TapTap.schedule()
        break
      }
      case MODULES.V2EX: {
        await V2ex.schedule()
        break
      }
      default: {
        // eslint-disable-next-line no-console
        console.log('>>> SCHEDULE >> moduleSchedule: not find module')

        return false
      }
    }
    await sendToRenderer('refresh', {
      module: moduleName,
      status: new Date().toISOString(),
    })
    return true
  }

  /**
   * 定时任务列表
   */
  async list() {
    try {
      const keys = Object.keys(global.jobs)
      if (!keys.length)
        return []

      const jobList = []
      for (const key of keys) {
        jobList.push({
          name: key,
          next: dayjs(global.jobs[key].nextInvocation()).format('YYYY-MM-DD HH:mm:ss'),
        })
      }
      return jobList
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log('>>> Services >> schedule > list: ', e)
      return []
    }
  }
}

/**
 * 定时任务初始化
 */
export async function scheduleInit() {
  try {
    const scheduleInstance = new Schedule()
    const modules = Object.values(MODULES)
    for (const moduleName of modules)
      await scheduleInstance.dealByModule(moduleName)

    // eslint-disable-next-line no-console
    console.log('>>> Services >> schedule > scheduleInit jobs: ', Object.keys(global.jobs))
  }
  catch (e) {
    // eslint-disable-next-line no-console
    console.log('>>> Services >> schedule > scheduleInit error: ', e)

    return false
  }
}

export default new Schedule()
