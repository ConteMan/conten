import type { Context } from 'koa'
import { createOrUpdate as infoCreateOrUpdate } from '@main/services/info'
import RequestCache from '@main/services/requestCache'

class ExtensionController {
  /**
   * 添加
   * @param ctx - 请求信息
   */
  async add(ctx: Context) {
    try {
      const { type, data } = ctx.request.body
      const requestTypes = ['one']

      let res = null
      if (requestTypes.includes(type))
        res = await RequestCache.set(`extension_${type}`, data)
      else
        res = await infoCreateOrUpdate(data)

      ctx.body = res
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log('>>> Server >> controller > info add', e)
      return ctx.throw('Error', 500)
    }
  }
}

export default new ExtensionController()
