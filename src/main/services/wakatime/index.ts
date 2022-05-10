import fetch from 'node-fetch'
import { getConfigByKey } from '~/main/services/config'
import RequestCache from '~/main/services/requestCache'

class WakaTime {
  private name: string
  public apiKeyConfigName = 'wakatime_api_key'
  public apiUrl = 'https://wakatime.com/api/v1'

  constructor() {
    this.name = 'wakatime'
  }

  async getData(range: string = 'Today') {
    const wakatimeApiKey = await getConfigByKey(this.apiKeyConfigName)
    if (!wakatimeApiKey)
      return null

    try {
      const url = `${this.apiUrl}/users/current/summaries?api_key=${wakatimeApiKey.value}&range=${range}`
      const res = await fetch(url, {
        method: 'GET',
      })
      return await res.json()
    }
    catch(e) {
      return false
    }
  }

  /**
   * Get data by cache
   * @param range 
   * @param refresh 
   */
  async getDataByCache(range: string = 'Today', refresh: boolean = false, expired: number = 3600) {
    const cacheName = `${this.name}-data-${range}`
    if (!refresh) {
      const cache = await RequestCache.get(cacheName)
      if (cache)
        return cache
    }

    const data = await this.getData(range)
    if (!data)
      return null

    const cacheRes = await RequestCache.set(cacheName, data as object, expired)
    return cacheRes
  }
}

export default new WakaTime()
