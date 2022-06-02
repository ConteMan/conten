import type { Context } from 'koa'
import { createOrUpdate } from '@main/services/info'
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
      if (requestTypes.includes(type)) {
        ctx.body = RequestCache.set(`extension_${type}`, data)
      }
      else {
        const res = await createOrUpdate(data)
        ctx.body = res
      }
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log('>>> Server >> controller > info add', e)
      return ctx.throw('Error', 500)
    }
  }
}

export default new ExtensionController()
