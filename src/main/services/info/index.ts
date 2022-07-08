import type { moduleType } from '@main/services/dom/type'
import type { Info as InfoType } from '@main/types/info'
import dayjs from 'dayjs'
import Dom from '@main/services/dom'
import { bulkCreateOrUpdate } from '@main/services/info'

class Info {
  public name = 'info'

  /**
   * Libvio 处理
   */
  async libvio() {
    const domModules: { module: moduleType; options: { type: string } }[] = [
      {
        module: 'libvio',
        options: {
          type: 'latest',
        },
      },
    ]
    for await (const item of domModules) {
      const infoList: InfoType[] = []
      const list = await Dom.list(item.module, item.options)
      if (list) {
        list.forEach((lItem: any) => {
          infoList.push(
            {
              platform: item.module,
              platform_type: item.options.type,
              slug: `${item.module}_${item.options.type}_${lItem.id}`,
              info_at: dayjs(lItem.updated_at).toISOString(),
              data: lItem,
            })
        })

        // eslint-disable-next-line no-console
        console.log(infoList)

        if (infoList.length)
          await bulkCreateOrUpdate(infoList)
      }
    }
  }

  /**
   * 定时任务
   * @param type - 类型
   */
  async schedule(type: 'all' | 'libvio' = 'all') {
    try {
      if (['all', 'libvio'].includes(type))
        await this.libvio()
      return true
    }
    catch (e) {
      return false
    }
  }
}

export default new Info()
