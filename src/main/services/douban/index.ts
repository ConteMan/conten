import type { Options } from 'got'
import GOT from 'got'
import _ from 'lodash'
import * as cheerio from 'cheerio'
import Logger from '@main/services/log'
import { randomStr } from '@main/utils'

type DoubanType = 'movie' | 'book' | 'music'
type DoubanStatus = 'collect' | 'do' | 'wish'
type DoubanMode = 'grid' | 'list'
interface DoubanHtmlRequest {
  id?: string
  type?: DoubanType
  status?: DoubanStatus
  start?: number
  sort?: 'time'
  filter?: 'all'
  mode?: DoubanMode
}
interface MovieItem {
  linkId?: string
  title?: string
  intro?: string
  link?: string
  date?: string
  pic?: string
  comment?: string
  rate?: number
}
interface Movie {
  total_count?: number
  start?: number
  end?: number
  items?: MovieItem[]
  next?: boolean
}

class Douban {
  public name = 'douban'
  public moduleKey = `${module}_module`
  public baseurl = 'douban.com'
  public siteUrl = 'https://www.douban.com'

  /**
   * 获取豆瓣电影数据
   * @param params - 参数
   */
  async movie(params?: DoubanHtmlRequest) {
    try {
      const defaultParams: DoubanHtmlRequest = {
        id: 'bolu_zz',
        type: 'movie',
        status: 'do',
        start: 1,
        sort: 'time',
        filter: 'all',
        mode: 'grid',
      }
      params = params ? _.merge({}, defaultParams, params) : defaultParams

      const html = await this.html(params)
      const { type } = params
      if (html && type) {
        const data = await this.format(type, html)
        return data
      }
      return {}
    }
    catch (e) {
      return {}
    }
  }

  /**
   * 获取豆瓣页面数据
   * @param params - 参数
   */
  async html(params: DoubanHtmlRequest) {
    const { id, type, start, sort, filter, mode, status } = params
    if (!id || !type)
      return false

    const dealStart = (type === 'book' && start === 1) ? 0 : start

    const cookie = `bid=${randomStr(12)}; ll="${randomStr(6, '123456789')}"`
    const url = `https://${type}.${this.baseurl}/people/${id}/${status}`
    const query = {
      start: dealStart,
      sort,
      filter,
      mode,
    }
    const options: Options = {
      url,
      searchParams: query,
      resolveBodyOnly: true,
      responseType: 'text',
      isStream: false,
      headers: {
        Cookie: cookie,
        UserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36',
      },
    }
    try {
      const html = await GOT(options)
      return html as string
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log('>>> douban', e)
      Logger.error('douban', 'get douban html error', {
        options,
      })
      return false
    }
  }

  /**
   * 数据格式化
   * @param type - 类型，movie, book, music
   * @param htmlString - 页面数据
   */
  async format(type: DoubanType, htmlString: string) {
    if (type === 'movie')
      return this.movieFormat(htmlString)
    return false
  }

  /**
   * 电影页面数据格式化
   * @param htmlString - 页面数据
   */
  async movieFormat(htmlString: string) {
    const items: MovieItem[] = []
    const data: Movie = {}
    try {
      const $ = cheerio.load(htmlString)
      const itemElements = $('#wrapper .article .item')
      if (!itemElements.length)
        return data

      for (let i = 0; i < itemElements.length; i++) {
        const item = itemElements[i]

        const infoDom = $(item).find('.info')
        const picDom = $(item).find('.pic')
        const titleDom = $(infoDom).find('li.title a')
        const introDom = $(infoDom).find('li.intro')
        const linkDom = $(picDom).find('a')
        const dateDom = $(infoDom).find('li > span.date')
        const rateDom = $(infoDom).find('li > span.date').prev()
        const picSrcDom = $(picDom).find('a > img')
        const commentDom = $(infoDom).find('li > span.comment')

        const titleValue = $(titleDom).text().replace(/<em>|<\/em>|\s{3,}/gi, '')
        const introValue = $(introDom).text()
        const linkValue = $(linkDom).attr('href')
        const dateValue = $(dateDom).text().replace(/\s/gi, '')
        const picSrcValue = $(picSrcDom).attr('src')
        const commentValue = $(commentDom).text()
        let rateValue = $(rateDom).attr('class')
        if (rateValue)
          rateValue = rateValue.replace(/\D/gi, '')
        else
          rateValue = ''

        const linkArray = linkValue?.split('/')
        const linkId = linkArray?.[linkArray.length - 2]

        items.push({
          linkId,
          title: titleValue,
          intro: introValue,
          link: linkValue,
          date: dateValue,
          pic: picSrcValue,
          comment: commentValue,
          rate: parseInt(rateValue),
        })
      }

      const numberStr = $('#wrapper #content .mode .subject-num').text().replace(/\s/gi, '')
      const numberArr = numberStr.split('/')
      const total = parseInt(numberArr[1])
      const startEnd = numberArr[0].split('-')
      const start = parseInt(startEnd[0])
      const end = parseInt(startEnd[1])

      data.total_count = total
      data.start = start
      data.end = end
      data.items = items
      data.next = total !== end
      return data
    }
    catch (e) {
      return data
    }
  }
}

export default new Douban()
