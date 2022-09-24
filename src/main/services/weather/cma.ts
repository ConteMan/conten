import { customRequest } from '@main/utils/request'

const url = 'https://weather.cma.cn/api/weather/view'

const getWeather = async () => {
  try {
    // TODO: 返回类型
    const response = await customRequest({
      url,
    })
    if (!response || !response.data)
      return false
    return response.data.data
  }
  catch (e) {
    return {}
  }
}

export { getWeather }
