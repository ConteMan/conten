import type { moduleType } from '@main/services/dom/type'
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
}

export default new Dom()
