import ConfigModel from '~/main/models/config'
import Schedule from '~/main/services/schedule'

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
 * 配置处理
 * @param data - 配置数据
 */
async function dealSetting(data: any) {
  const { key } = data

  let moduleName = ''

  switch (key) {
    case 'wakatime_schedule_enable':
    case 'wakatime_schedule': {
      moduleName = 'wakatime'
      break
    }
    default:
      break
  }

  if (!moduleName)
    return false

  return await Schedule.dealByModule(moduleName)
}

export { getConfigsByGroup, getConfigByKey, setConfig }
