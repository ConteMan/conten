import type { Context } from 'koa'
import dayjs from 'dayjs'
import { bulkCreateOrUpdate as infoBulkCreateOrUpdate } from '@main/services/info'
import RequestCache from '@main/services/requestCache'
import { listFormat as libvioListFormat } from '@main/services/dom/modules/libvio'
import { listFormat as ddrkListFormat } from '@main/services/dom/modules/ddrk'
import type { Info as InfoType } from '@main/types/info'

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
      if (requestTypes.includes(type)) { // 请求缓存
        res = await RequestCache.set(`extension_${type}`, data)
      }
      else { // Info 模块
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

      return ctx.body = res
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log('>>> server >> controller > info add', e)
      return ctx.throw('Error', 500)
    }
  }

  /**
   * 处理 movie 数据
   * @param ctx - 请求信息
   */
  async movie(ctx: Context) {
    try {
      const { data, type: platform } = ctx.request.body
      const { type, html } = data

      const dealType = `${platform}_${type}`

      let list = []
      let platform_type = ''
      switch (dealType) {
        case 'ddrk_list-latest': {
          list = await ddrkListFormat(html)
          platform_type = 'latest'
          break
        }
        case 'libvio_list-latest':
        default: {
          list = await libvioListFormat(html)
          platform_type = 'latest'
          break
        }
      }

      const infoList: InfoType[] = []
      if (list && list.length) {
        list.forEach((lItem: any) => {
          infoList.push(
            {
              platform,
              platform_type,
              slug: `${platform}_${platform_type}_${lItem.id}`,
              info_at: dayjs().toISOString(),
              data: lItem,
            })
        })

        // eslint-disable-next-line no-console
        console.log(infoList)

        if (infoList.length)
          await infoBulkCreateOrUpdate(infoList)
      }
      return ctx.body = true
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log('>>> server >> controller > extension - libvio', e)
      return ctx.throw('Error', 500)
    }
  }
}

export default new ExtensionController()
