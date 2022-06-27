import type { Context } from 'koa'
import dayjs from 'dayjs'
import { bulkCreateOrUpdate as infoBulkCreateOrUpdate } from '@main/services/info'
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
      if (requestTypes.includes(type)) {
        res = await RequestCache.set(`extension_${type}`, data)
      }
      else {
        const dealData: any[] = []
        if (type === 'sspai') {
          data.forEach((item: any) => {
            dealData.push({
              platform: type,
              platform_type: `${type}-${item.ca_module_type}`,
              slug: `${type}_${item.ca_data_id}`,
              info_at: dayjs(item.ca_sort_at),
              data: item,
            })
          })
        }
        if (dealData.length)
          res = await infoBulkCreateOrUpdate(dealData)
      }

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
