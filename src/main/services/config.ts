import ConfigModel from '~/main/models/config'

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
    return true
  }
  catch (e) {
    // eslint-disable-next-line no-console
    console.log(`>>> setConfig error: ${e}`)
    return null
  }
}

export { getConfigsByGroup, getConfigByKey, setConfig }
