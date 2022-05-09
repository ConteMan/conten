import fetch from 'node-fetch'
import { getConfigByKey } from '~/main/services/config'

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
}

export default new WakaTime()
