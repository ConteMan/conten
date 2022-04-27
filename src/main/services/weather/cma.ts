import fetch from 'node-fetch'

const url = 'https://weather.cma.cn/api/weather/view'

const getWeather = async () => {
  try {
    // TODO: 返回类型
    const response: any = await fetch(url)
    const json = await response.json()
    return json?.data ?? null
  }
  catch(e) {
    return {}
  }
}

export { getWeather }
