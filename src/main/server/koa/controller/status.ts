import { ConfigEnum } from '~/main/config/enum'

async function status() {
  if (global.store) {
    const res = await global.store[ConfigEnum.EXTENSION_COMMAND].store
    return res
  }
  return {}
}

export { status }
