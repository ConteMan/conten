import { ScheduleList } from '@main/setting'
import ScheduleModel from '@main/models/schedule'
import CrontabParser from 'cron-parser'
import dayjs from 'dayjs'
import type { ScheduleModel as ScheduleModelType } from './type'

class ScheduleSetting {
  /**
   * 初始化
   */
  async init() {
    try {
      for await (const item of ScheduleList) {
        await ScheduleModel.findOrCreate({
          where: {
            name: item.name,
          },
          defaults: {
            name: item.name,
            key: item.key,
            enable: 0,
          },
        })
      }
      return true
    }
    catch (e) {
      return false
    }
  }

  /**
   * 列表
   */
  async list() {
    try {
      return await ScheduleModel.findAll({
        raw: true,
      })
    }
    catch (e) {
      return false
    }
  }

  /**
   * 保存
   * @param id - ID
   * @param data - 内容
   */
  async save(id: number, data: Pick<ScheduleModelType, 'crontab' | 'enable'>) {
    try {
      const res = await ScheduleModel.findByPk(id)
      if (res) {
        if (data.crontab) {
          const interval = CrontabParser.parseExpression(data.crontab)
          if (interval) {
            const next_at = dayjs(interval.next().toString())
            res.update({
              ...data,
              next_at,
            })
          }
        }
        else {
          res.update(data)
        }
        return await res.save()
      }
      else {
        return false
      }
    }
    catch (e) {
      return false
    }
  }
}

export default new ScheduleSetting()
