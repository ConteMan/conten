import NodeSchedule from 'node-schedule'
import dayjs from 'dayjs'
import { sendToRenderer } from '@main/utils/ipcMessage'
import { KEYS, MODULES } from '@main/enums/scheduleEnum'
import { getConfigByKey } from '@main/services/config'
import WakaTime from '@main/services/wakatime'
import { schedule as weatherSchedule } from '@main/services/weather'
import TapTap from '@main/services/taptap'
import System from '@main/services/system'
import V2ex from '@main/services/v2ex'
import Douban from '@main/services/douban'
import ScheduleModel from '@main/models/schedule'
import { Op } from 'sequelize'
import CrontabParser from 'cron-parser'
import Info from '@main/services/info/index'

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
      case MODULES.DOUBAN: {
        await Douban.schedule()
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

  /**
   * 执行通过「定时设置」模块设定的定时任务
   */
  async run() {
    try {
      const res: any = await ScheduleModel.findAll({
        where: {
          enable: 1,
          crontab: {
            [Op.or]: {
              [Op.not]: null,
              [Op.not]: '',
            },
          },
        },
        raw: true,
      })

      if (!res.length)
        return false

      // eslint-disable-next-line no-console
      console.log('>>> services >> schedule > run start')

      await Promise.all(res.map(async (item: any) => {
        const interval = CrontabParser.parseExpression(item.crontab)

        if (!item.next_at) { // 没有下次执行时间
          const target = await ScheduleModel.findByPk(item.id)
          target?.set('next_at', dayjs(interval.next().toString()))
          target?.save()
          return true
        }
        else {
          // eslint-disable-next-line no-console
          console.log('>>> services >> schedule > run', item.next_at, dayjs().isBefore(dayjs(item.next_at)))
          if (dayjs().isBefore(dayjs(item.next_at))) { // 未到执行时间
            return true
          }
          else {
            this.scheduleByKey(item.key)
            const target = await ScheduleModel.findByPk(item.id)
            target?.set('last_at', new Date()) // 实际开始执行的时间
            target?.set('next_at', dayjs(interval.next().toString()))
            target?.save()
            return true
          }
        }
      })).finally(() => {
        // eslint-disable-next-line no-console
        console.log('>>> services >> schedule > run end')
      })
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log('>>> schedule >> run >> error', e)
      return false
    }
  }

  /**
   * 根据 Key 执行任务
   * @param key - 任务键名
   */
  async scheduleByKey(key: string) {
    // eslint-disable-next-line no-console
    console.log('>>> services >> schedule > scheduleByKey', key)

    let moduleName = ''
    try {
      switch (key) {
        case KEYS.WAKATIME: {
          moduleName = 'wakatime'
          await WakaTime.schedule()
          break
        }
        case KEYS.WEATHER: {
          moduleName = 'weather'
          await weatherSchedule()
          break
        }
        case KEYS.TASK_CLEAN: {
          await System.schedule()
          break
        }
        case KEYS.DOUBAN: {
          moduleName = 'douban'
          await Douban.schedule()
          break
        }
        case KEYS.V2EX: {
          moduleName = 'v2ex'
          await V2ex.schedule()
          break
        }
        case KEYS.TAPTAP: {
          moduleName = 'taptap'
          await TapTap.schedule()
          break
        }
        case KEYS.INFO_FOOTBALL: {
          moduleName = 'info'
          await Info.schedule('football')
          break
        }
        case KEYS.INFO_LIBVIO:
        default: {
          // eslint-disable-next-line no-console
          console.log('>>> SCHEDULE >> moduleSchedule: not find module')

          return false
        }
      }
      if (moduleName) {
        await sendToRenderer('refresh', {
          module: moduleName,
          status: new Date().toISOString(),
        })
      }
      return true
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log('>>> schedule >> taskByKey >> error', e)
      return false
    }
  }
}

/**
 * 定时任务初始化
 */
export async function scheduleInit() {
  try {
    const scheduleInstance = new Schedule()
    // const modules = Object.values(MODULES)
    // for (const moduleName of modules)
    //   await scheduleInstance.dealByModule(moduleName)

    const job = NodeSchedule.scheduleJob('* * * * *', async () => {
      await scheduleInstance.run()
    })
    global.jobs = {
      BASE: job,
      ...global.jobs,
    }

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
