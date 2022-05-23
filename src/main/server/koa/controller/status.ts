import { ConfigEnum } from '~/main/enums/configEnum'

async function status() {
  if (global.store) {
    const res = await global.store[ConfigEnum.DEFAULT_NAME].store
    return res
  }
  return {}
}

export { status }
