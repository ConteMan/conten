import type { moduleType } from '@main/services/dom/type'
import { customRequest } from '@main/utils/request'
import { list as libvioList } from './modules/libvio'
class Dom {
  public name = 'dom'

  /**
   * 列表数据
   * @param module - 模块
   * @param options - 选项
   */
  async list(module: moduleType, options: any) {
    try {
      const moduleList: Record<moduleType, Function> = {
        libvio: libvioList,
      }

      return await moduleList[module](options)
    }
    catch (e) {
      return false
    }
  }

  /**
   * 请求数据
   * @param url - 网址
   * @param options - 请求选项
   */
  async requestData(url: string, options: any = {}) {
    try {
      const dealOptions = {
        url,
        method: 'GET',
        responseType: 'text',
        timeout: 10000,
        maxRedirects: 20,

        proxy: false,
      }

      if (Object.keys(options).length)
        Object.assign(dealOptions, options)

      const res = await customRequest(dealOptions)
      return res ? { data: res.data } : null
    }
    catch (e) {
      return false
    }
  }
}

export default new Dom()
