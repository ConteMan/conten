import type { DoubanHtmlRequest, DoubanStatus, DoubanType, ItemType } from '@main/services/douban'
import { getConfigByKey } from '@main/services/config'
import Douban from '@main/services/douban'
import SubjectModel from '@main/models/subject'
import { sleep } from '@main/utils'
import { random } from 'lodash'

export type SubjectPlatforms = 'douban' | 'bgm'
export type SubjectMode = 'increment' | 'full'
export interface SubjectSyncParams {
  type: DoubanType
  status: DoubanStatus
  startPage: number
  endPage: number
}
export type SubjectType = DoubanType
export type SubjectStatus = DoubanStatus

class Subject {
  /**
   * 同步数据
   * @param platform - 平台，douban, bgm
   */
  async sync(platform: SubjectPlatforms = 'douban', mode: SubjectMode = 'increment', params: SubjectSyncParams) {
    if (platform === 'douban')
      return await this.syncDouban(mode, params)
    return false
  }

  /**
   * 同步豆瓣数据
   * @param mode - 模式，increment, full
   * @param params - 参数
   * - @param type - 类型，movie, book, music
   * - @param status - 状态，wish, do, collect
   * - @param startPage - 开始页码
   * - @param endPage - 结束页码
   */
  async syncDouban(mode: SubjectMode = 'increment', params: SubjectSyncParams) {
    try {
      const { type = 'movie', status = 'collect', startPage = 1 } = params
      let { endPage = 1 } = params

      if (mode === 'full') // TODO: 全量同步，暂时设置为极限判断
        endPage = 1000

      let count = 0
      for (let page = startPage; page <= endPage; page++) {
        const pageList = await this.doubanList(type, status, page)

        if (!pageList)
          break

        const { items, next } = pageList
        if (!items || !items.length)
          break

        for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
          await sleep(random(1, 5) * 1000)
          const { id: douban_id } = items[itemIndex]

          if (!douban_id)
            continue

          const itemData = await Douban.data(type, douban_id)
          if (!itemData)
            continue

          const itemFormatData = await this.doubanFormat(type, status, items[itemIndex], itemData)
          // eslint-disable-next-line no-console
          console.log(itemFormatData)

          const res = await this.save(itemFormatData)
          if (res)
            count++
        }
        if (!next)
          break
      }
      return count
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log('>>> Subject >> syncDouban error', e)
      return false
    }
  }

  /**
   * 获取豆瓣列表
   * @param type - 类型，movie, book, music
   * @param status - 状态，wish, do, collect, on_hold, dropped
   * @param page - 页码
   */
  async doubanList(type: DoubanType = 'movie', status: DoubanStatus = 'collect', page = 1) {
    try {
      const PAGE_SIZE = 15
      const doubanIdKey = 'douban_id'
      const doubanIdRes = await getConfigByKey(doubanIdKey)
      if (!doubanIdRes)
        return false

      const params: DoubanHtmlRequest = {
        id: doubanIdRes.value,
        type,
        status,
        start: (page - 1) * PAGE_SIZE,
      }
      return await Douban.list(params)
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log('>>> Subject >> doubanList error', e)
      return false
    }
  }

  /**
   * 格式化豆瓣数据
   * @param type - 类型，movie, book, music
   * @param status - 状态，wish, do, collect
   * @param introData - 列表数据
   * @param detailData - 详情数据
   */
  async doubanFormat(type: DoubanType, status: DoubanStatus, introData: ItemType, detailData: any) {
    try {
      const data: any = {}
      data.type = type
      data.status = status

      const { id: douban_id } = introData

      if (type === 'movie') {
        const { imdb } = detailData
        if (!douban_id && !imdb)
          return false
        data.slug = imdb?.value || douban_id
        data.name = detailData.title.value
        data.status_at = { [status]: introData.date }
        data.info_at = introData.date ?? new Date()
        data.images = { detail: introData.pic }
        data.eps = detailData.episodes ? detailData.episodes.value : 1
        data.collect_eps = null
        data.douban_id = douban_id
        data.douban_data = { ...introData, ...detailData }
        data.imdb_id = imdb?.value
        data.bgm_id = ''
        data.bgm_data = {}
      }
      if (type === 'book') {
        const { isbn } = detailData
        if (!douban_id && !isbn)
          return false
        data.slug = isbn?.value || douban_id
        data.name = detailData.title.value
        data.status_at = { [status]: introData.date }
        data.info_at = introData.date ?? new Date()
        data.images = { detail: introData.pic }
        data.eps = detailData.episodes ? detailData.episodes.value : 1
        data.collect_eps = null
        data.douban_id = douban_id
        data.douban_data = { ...introData, ...detailData }
        data.imdb_id = null
        data.bgm_id = ''
        data.bgm_data = {}
      }
      return data
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log('>>> Subject >> formatDouban error', e)
      return false
    }
  }

  /**
   * 保存数据
   * @param data - 数据
   */
  async save(data: any) {
    try {
      const { slug } = data
      if (!slug)
        return false
      const [res, created] = await SubjectModel.findOrCreate({
        where: {
          slug,
        },
        defaults: data,
      })
      if (!created) { // TODO: 平台未有的状态类型更新，需要逻辑判断，比如：已经为 drop 状态数据，需要特殊标记（手动处理）才可以更新为其他状态
        delete data.slug
        res.set(data)
        await res.save()
      }
      return res
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log('>>> Subject >> save error', e)
      return false
    }
  }

  /**
   * 条目列表
   * @param type - 类型，movie, book, music
   * @param status - 状态，wish, do, collect
   * @param page - 页码
   * @param pageSize - 页大小
   */
  async list(type: SubjectType = 'movie', status: SubjectStatus = 'do', page = 1, pageSize = 15) {
    try {
      const res = await SubjectModel.findAndCountAll({
        where: {
          type,
          status,
        },
        offset: (page - 1) * pageSize,
        limit: pageSize,
        order: [
          ['info_at', 'DESC'],
        ],
        raw: true,
      })
      return res
    }
    catch (e) {
      return false
    }
  }
}

export default new Subject()
