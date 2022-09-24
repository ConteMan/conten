import dayjs from 'dayjs'
import RequestCacheModel from '@main/models/requestCache'

class RequestCache {
  /**
   * 获取缓存
   * @param name - 缓存名
   * @param ignoreExpired - 忽略过期
   */
  async get(name: string, ignoreExpired = false) {
    try {
      const cache = await RequestCacheModel.findOne({
        where: {
          name,
        },
        attributes: ['data', 'expired', 'updated_at'],
      })

      if (!cache)
        return null

      if (!ignoreExpired && dayjs(cache.toJSON()?.expired).isBefore(dayjs()))
        return null

      return cache.toJSON()
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log(`>>> RequestCache.get error: ${e}`)
      return null
    }
  }

  /**
   * 设置缓存
   * @param name - 缓存名
   * @param data - 缓存数据
   * @param expiredSeconds - 过期时间，单位秒
   */
  async set(name: string, data: object, expiredSeconds = 600) {
    try {
      const expired = dayjs().add(expiredSeconds, 'second').toDate()
      const [cache, created] = await RequestCacheModel.findOrCreate({
        where: {
          name,
        },
        defaults: {
          name,
          data,
          expired,
        },
      })

      if (created)
        return cache

      const [updateNumber] = await RequestCacheModel.update({
        data,
        expired,
      }, {
        where: {
          name,
        },
      })

      if (!updateNumber)
        return null

      const res = await RequestCacheModel.findOne({
        where: {
          name,
        },
        attributes: ['data', 'expired'],
      })
      return res?.toJSON()
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log(`>>> RequestCache.set error: ${e}`)
      return null
    }
  }
}

export default new RequestCache()
