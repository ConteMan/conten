import type { DoubanHtmlRequest, DoubanStatus, DoubanType, MovieItem } from '@main/services/douban'
import { getConfigByKey } from '@main/services/config'
import Douban from '@main/services/douban'
import SubjectMode from '@main/models/subject'

class Subject {
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
      return await Douban.movieList(params)
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log('>>> Subject >> doubanList error', e)
      return false
    }
  }

  /**
   * 同步数据
   * @param platform - 平台，douban, bgm
   */
  async sync(platform = 'douban') {
    if (platform === 'douban')
      return await this.syncDouban()
    return false
  }

  /**
   * 同步豆瓣数据
   * @param type - 类型，movie, book, music
   * @param status - 状态，wish, do, collect
   * @param startPage - 开始页码
   * @param endPage - 结束页码
   */
  async syncDouban(type: DoubanType = 'movie', status: DoubanStatus = 'collect', startPage = 1, endPage = 1) {
    try {
      let count = 0
      for (let page = startPage; page <= endPage; page++) {
        const pageList = await this.doubanList(type, status, page)
        if (!pageList)
          continue
        const { items, next } = pageList
        if (!items || !items.length)
          continue
        for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
          const { id: douban_id } = items[itemIndex]
          if (!douban_id)
            continue
          let itemFormatData
          if (type === 'movie') {
            const itemData = await Douban.movie(douban_id)
            itemFormatData = await this.formatDouban(type, status, items[itemIndex], itemData)
            // eslint-disable-next-line no-console
            console.log(itemFormatData)
          }
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
   * 格式化豆瓣数据
   * @param type - 类型，movie, book, music
   * @param status - 状态，wish, do, collect
   * @param introData - 列表数据
   * @param detailData - 详情数据
   */
  async formatDouban(type: DoubanType, status: DoubanStatus, introData: MovieItem, detailData: any) {
    try {
      const data: any = {}
      data.type = type
      data.status = status

      const { id: douban_id } = introData
      const { imdb } = detailData
      if (!douban_id && !imdb)
        return false
      data.slug = imdb.value || douban_id
      data.name = detailData.title.value
      data.status_at = { [status]: new Date() }
      data.images = { detail: introData.pic }
      data.eps = detailData.episodes ? detailData.episodes.value : 1
      data.collect_eps = []
      data.douban_id = douban_id
      data.douban_data = { ...introData, ...detailData }
      data.imdb_id = imdb.value
      data.bgm_id = ''
      data.bgm_data = {}
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
      const [res, created] = await SubjectMode.findOrCreate({
        where: {
          slug,
        },
        defaults: data,
      })
      if (!created) {
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
}

export default new Subject()
