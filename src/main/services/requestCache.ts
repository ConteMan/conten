import dayjs from 'dayjs'
import RequestCacheModel from '~/main/models/requestCache'

class RequestCache {
  async get(name: string) {
    try {
      const cache = await RequestCacheModel.findOne({
        where: {
          name,
        },
        attributes: ['data', 'expired'],
      })

      if (!cache)
        return null

      if (dayjs(cache.toJSON()?.expired).isBefore(dayjs()))
        return null

      return cache.toJSON()
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log(`>>> RequestCache.get error: ${e}`)
      return null
    }
  }

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
