import type { moduleType } from '@main/services/dom/type'
import type { Info as InfoType } from '@main/types/info'
import dayjs from 'dayjs'
import Dom from '@main/services/dom'
import { bulkCreateOrUpdate } from '@main/services/info'
import { format as footballSinaFormat } from '@main/services/dom/modules/footballSina'

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
   * 足球信息处理
   * @param tid - 球队 ID
   */
  async football(tid = 52) {
    try {
      const platform = 'football'
      const platform_type = 'match'
      const htmlData = await Dom.requestData(`http://match.sports.sina.com.cn/iframe/football/team_iframe.php?id=${tid}&year=2022&dpc=1`, {
        responseType: 'arraybuffer', // 关键步骤
        responseEncoding: 'utf8',
        decode: 'GB2312',
      })
      if (htmlData && htmlData?.data) {
        const infoList: InfoType[] = []
        const list = await footballSinaFormat(htmlData?.data, { tid })
        if (list) {
          list.forEach((item: any) => {
            infoList.push(
              {
                platform,
                platform_type,
                slug: `${tid}_${item.time}_${item.home_team_id}_${item.visiting_team_id}`,
                info_at: dayjs(item.time).toISOString(),
                data: item,
              })
          })

          // eslint-disable-next-line no-console
          console.log(infoList)

          if (infoList.length)
            await bulkCreateOrUpdate(infoList)
        }
      }
      return false
    }
    catch (e) {
      return false
    }
  }

  /**
   * 定时任务
   * @param type - 类型
   */
  async schedule(type: 'all' | 'football' = 'all') {
    try {
      if (['football'].includes(type)) {
        await this.football(52) // 曼联
        await this.football(53) // 利物浦
        await this.football(216) // 曼城
      }
      return true
    }
    catch (e) {
      return false
    }
  }
}

export default new Info()
