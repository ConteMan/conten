import LogModel from '@main/models/log'
import { LevelEnum } from '@main/enums/logEnum'

/**
 * 日志列表
 * @param type - 类型
 * @param page - 页数
 * @param pageSize - 页码
 */
export async function logList(type: string, page = 1, pageSize = 10) {
  try {
    const offset = (page - 1) * pageSize
    let where = {}
    if (type)
      where = { type }
    const { count, rows } = await LogModel.findAndCountAll({
      where,
      offset,
      limit: pageSize,
      order: [
        ['info_at', 'DESC'],
      ],
    })
    const dealRows = rows.map((item) => {
      return item.toJSON()
    })
    return {
      count,
      rows: dealRows,
    }
  }
  catch (e) {
    // eslint-disable-next-line no-console
    console.log('>>> Log >> logList', e)
    return null
  }
}

class Logger {
/**
 * 日志记录器
 * @param level - 级别
 * @param type - 类型
 * @param desc - 日志描述
 * @param data - 其他数据
 */
  public static async logger(level: LevelEnum = LevelEnum.INFO, type: string, desc: string, data: any = {}) {
    try {
      const { detail = null, info_at = new Date() } = data
      // eslint-disable-next-line no-console
      console.log('>>> Log >> logger', data)
      await LogModel.create({
        level,
        type,
        detail,
        desc,
        info_at,
      })
      return true
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log('>>> Log >> addLog', e)
      return null
    }
  }

  public static async info(type: string, desc: string, data: any = {}) {
    return await Logger.logger(LevelEnum.INFO, type, desc, data)
  }

  public static async error(type: string, desc: string, data: any = {}) {
    return await Logger.logger(LevelEnum.ERROR, type, desc, data)
  }
}

export default Logger
