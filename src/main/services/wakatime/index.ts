import fetch from 'node-fetch'

import { getConfigByKey } from '@main/services/config'
import RequestCache from '@main/services/requestCache'
import { sendToRenderer } from '@main/utils/ipcMessage'

class WakaTime {
  private name: string
  public apiKeyConfigName = 'wakatime_api_key'
  public apiUrl = 'https://wakatime.com/api/v1'

  constructor() {
    this.name = 'wakatime'
  }

  /**
   * 获取数据
   * @param range - 时间范围 Today, Week, Month
   */
  async getData(range = 'Today') {
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
    catch (e) {
      return false
    }
  }

  /**
   * 通过缓存获取数据
   * @param range
   * @param refresh
   */
  async getDataByCache(range = 'Today', refresh = false, expired = 3600) {
    const cacheName = `${this.name}-data-${range}`
    if (!refresh) {
      const cache = await RequestCache.get(cacheName, true)
      if (cache)
        return cache
    }

    const data: any = await this.getData(range)
    if (!data || data?.error)
      return null

    const cacheRes = await RequestCache.set(cacheName, data as object, expired)
    return cacheRes
  }

  /**
   * 定时任务
   */
  async schedule() {
    await this.getDataByCache('Today', true)
    sendToRenderer('refresh', {
      module: 'wakatime',
    })
  }
}

export default new WakaTime()
