import { getWeather as cmaWeather } from './cma'
import requestCache from '~/main/services/requestCache'

const getWeather = async (source = 'cma', refresh = false) => {
  const cacheName = `weather-${source}`
  if (!refresh) {
    const cache = await requestCache.get(cacheName)
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

  const cacheRes = await requestCache.set(cacheName, data)
  return cacheRes
}

export { getWeather }
