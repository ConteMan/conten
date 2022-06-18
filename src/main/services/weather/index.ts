import { getWeather as cmaWeather } from './cma'
import RequestCache from '~/main/services/requestCache'

/**
 * 获取天气数据
 * @param source - 数据源
 * @param refresh - 是否刷新
 */
const getWeather = async (source = 'cma', refresh = false) => {
  const cacheName = `weather-${source}`
  if (!refresh) {
    const cache = await RequestCache.get(cacheName, true)
    if (cache)
      return cache
  }

  let data: any
  switch (source) {
    case 'cma':
    default:
      data = await cmaWeather()
  }

  if (!data)
    return null

  const cacheRes = await RequestCache.set(cacheName, data)
  return cacheRes
}

/**
 * 定时任务
 */
const schedule = async () => {
  await getWeather('cma', true)
}

export { getWeather, schedule }
