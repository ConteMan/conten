import { getWeather as cmaWeather } from "./cma"

const getWeather = async (source = 'cma') => {
  switch (source) {
    case 'cma':
      return await cmaWeather()
    default:
      return null
  }
}

export { getWeather }
