import ConfigModel from '~/main/models/config'

const configs = [
  {
    group_key: 'wakatime',
    key: 'wakatime_api_key',
    value: '',
  },
]

async function dbDefault() {
  await configDefault()
}

async function configDefault() {
  try {
    for (const config of configs) {
      const { group_key, key, value } = config
      await ConfigModel.findOrCreate({
        where: {
          group_key,
          key,
        },
        defaults: {
          group_key,
          key,
          value,
        }
      })
    }
  
    return true
  }
  catch(e) {
    console.log(`>>> configDefault error: ${e}`)
    return false
  }
}

export { dbDefault, configs }
