import _, { isObject } from 'lodash'
import ConfigModel from '@main/models/config'
import Schedule from '@main/services/schedule'

/**
 * 根据组别获取配置
 * @param group - 配置组
 * @param mode - 模式，all 全部内容，value 只获取值
 */
async function getConfigsByGroup(group: string, mode: 'all' | 'value' = 'value') {
  try {
    const configs = await ConfigModel.findAll({
      where: {
        group_key: group,
      },
      raw: true,
    })

    const res: any = {}
    configs.forEach((item: any) => {
      if (mode === 'all')
        res[item.key] = item

      else
        res[item.key] = item.value
    })
    return res
  }
  catch (e) {
    // eslint-disable-next-line no-console
    console.log(`>>> getConfigsByGroup error: ${e}`)
    return null
  }
}

/**
 * 根据配置项 key 获取配置
 * @param key - 配置项 key
 */
async function getConfigByKey(key = '') {
  try {
    if (!key)
      return null

    const config = await ConfigModel.findOne({
      where: {
        key,
      },
    })
    return config?.toJSON()
  }
  catch (e) {
    return null
  }
}

/**
 * 设置配置
 * @param data - 配置数据
 */
async function setConfig(data: any) {
  try {
    const { group_key, key, value } = data
    const config = await ConfigModel.findOne({
      where: {
        group_key,
        key,
      },
    })
    if (config) {
      await config.update({
        value,
      })
    }
    else {
      await ConfigModel.create(data)
    }

    await dealSetting(data)

    return true
  }
  catch (e) {
    // eslint-disable-next-line no-console
    console.log(`>>> setConfig error: ${e}`)
    return null
  }
}

/**
 * 合并式配置数据，适用于 JSON 格式数据
 * @param data - 配置数据
 */
async function mergeConfig(data: any) {
  try {
    const { group_key, key, value } = data
    const config = await ConfigModel.findOne({
      where: {
        group_key,
        key,
      },
    })
    if (config) {
      const currentValueRes = await config.get('value')
      const currentValue = JSON.parse(currentValueRes as any)
      _.merge(currentValue, value)
      await config.update({
        value: JSON.stringify(currentValue),
      })
    }
    else {
      await ConfigModel.create({
        group_key,
        key,
        value: isObject(value) ? JSON.stringify(value) : value,
      })
    }

    await dealSetting(data)

    return true
  }
  catch (e) {
    // eslint-disable-next-line no-console
    console.log(`>>> mergeConfig error: ${e}`)
    return null
  }
}

/**
 * 配置处理，如定时任务等
 * @param data - 配置数据
 */
async function dealSetting(data: any) {
  const { key } = data

  let moduleName = ''

  switch (key) { // TODO 不优雅
    case 'system_schedule_enable':
    case 'system_schedule': {
      moduleName = 'system'
      break
    }
    case 'wakatime_schedule_enable':
    case 'wakatime_schedule': {
      moduleName = 'wakatime'
      break
    }
    case 'weather_schedule_enable':
    case 'weather_schedule': {
      moduleName = 'weather'
      break
    }
    case 'taptap_schedule_enable':
    case 'taptap_schedule': {
      moduleName = 'taptap'
      break
    }
    case 'v2ex_schedule_enable':
    case 'v2ex_schedule': {
      moduleName = 'v2ex'
      break
    }
    default:
      break
  }

  if (!moduleName)
    return false

  return await Schedule.dealByModule(moduleName)
}

/**
 * 获取模块是否开启
 * @param moduleName - 模块名称
 */
async function moduleEnable(moduleName: string) {
  try {
    const config = await getConfigByKey(`${moduleName}_enable`)
    return config?.value > 0
  }
  catch (e) {
    // eslint-disable-next-line no-console
    console.log(`>>> moduleEnable error: ${e}`)
    return false
  }
}

export { getConfigsByGroup, getConfigByKey, setConfig, mergeConfig, moduleEnable }
