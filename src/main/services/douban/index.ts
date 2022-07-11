import _, { isArray } from 'lodash'
import * as cheerio from 'cheerio'
import Logger from '@main/services/log'
import { randomStr } from '@main/utils'
import { customRequest } from '@main/utils/request'
import Subject from '@main/services/subject'
import { getConfigByKey } from '@main/services/config'

export type DoubanType = 'movie' | 'book' | 'music'
export type DoubanStatus = 'collect' | 'do' | 'wish'
export type DoubanMode = 'grid' | 'list'

export interface DoubanHtmlRequest {
  id?: string
  type?: DoubanType
  status?: DoubanStatus
  start?: number
  sort?: 'time'
  filter?: 'all'
  mode?: DoubanMode
}
export interface ItemType {
  id?: string
  title?: string
  intro?: string
  link?: string
  date?: string
  pic?: string
  comment?: string
  rate?: number | string
}
export interface ListType {
  total_count?: number
  start?: number
  end?: number
  items?: ItemType[]
  next?: boolean
}

class Douban {
  public name = 'douban'
  public moduleKey = `${module}_module`
  public baseUrl = 'douban.com'
  public siteUrl = 'https://www.douban.com'
  public cookieConfigKey = 'douban_cookie'

  private cookieStr = `bid=${randomStr(12)}; ll="${randomStr(6, '123456789')}"`
  private userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36'

  /**
   * 获取 Cookie
   */
  async getCookie() {
    try {
      const res = await getConfigByKey(this.cookieConfigKey)
      if (res)
        this.cookieStr = res.value
      return true
    }
    catch (e) {
      return false
    }
  }

  /**
   * 获取详情页面
   * @param type - 类型，电影、读书
   * @param id - douban id
   */
  async html(type: string, id: string | number) {
    if (!id || !type)
      return false

    await this.getCookie()

    const url = `https://${type}.${this.baseUrl}/subject/${id}/`

    const options: any = {
      url,
      headers: {
        Cookie: this.cookieStr,
        UserAgent: this.userAgent,
      },
      method: 'GET',
      responseType: 'text',
      timeout: 10000,
      maxRedirects: 5,
    }
    try {
      const html = await customRequest(options)
      if (!html)
        return false
      return html.data as string
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log('>>> services >> douban >> html', e)
      Logger.error('douban', 'get douban html error', {
        options,
      })
      return false
    }
  }

  /**
   * 获取列表页面
   * @param params - 参数
   */
  async listHtml(params: DoubanHtmlRequest) {
    const { id, type, start, sort, filter, mode, status } = params
    if (!id || !type)
      return false

    await this.getCookie()

    const url = `https://${type}.${this.baseUrl}/people/${id}/${status}`
    const query = {
      start,
      sort,
      filter,
      mode,
    }
    const options: any = {
      url,
      params: query,
      headers: {
        Cookie: this.cookieStr,
        UserAgent: this.userAgent,
      },
      method: 'GET',
      responseType: 'text',
      timeout: 10000,
      maxRedirects: 5,
    }
    try {
      const html = await customRequest(options)
      if (!html)
        return false
      return html.data as string
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log('>>> services >> douban > listHtml', e)
      Logger.error('douban', 'get douban listHtml error', {
        detail: options,
      })
      return false
    }
  }

  /**
   * 列表数据格式化
   * @param type - 类型，movie, book, music
   * @param htmlString - 页面数据
   */
  async listFormat(type: DoubanType, htmlString: string) {
    if (type === 'movie')
      return this.movieListFormat(htmlString)
    if (type === 'book')
      return this.bookListFormat(htmlString)
    return false
  }

  /**
   * 列表数据（格式化后数据）
   * @param params - 参数
   */
  async list(params?: DoubanHtmlRequest) {
    try {
      const defaultParams: DoubanHtmlRequest = {
        id: '',
        type: 'movie',
        status: 'do',
        start: 0,
        sort: 'time',
        filter: 'all',
        mode: 'grid',
      }
      params = params ? _.merge({}, defaultParams, params) : defaultParams

      const html = await this.listHtml(params)
      const { type } = params
      if (html && type) {
        const data = await this.listFormat(type, html)
        return data
      }
      return {}
    }
    catch (e) {
      return {}
    }
  }

  /**
   * 根据类型和 ID 获取豆瓣格式化后数据
   * @param type - 类型，movie, book, music
   * @param id - 豆瓣 ID
   */
  async data(type: DoubanType, id: string) {
    if (type === 'movie')
      return await this.movie(id)
    if (type === 'book')
      return await this.book(id)
    return false
  }

  // ========== 影视 ==========

  /**
   * 影视列表，数据格式化
   * @param htmlString - 页面数据
   */
  async movieListFormat(htmlString: string) {
    const items: ItemType[] = []
    const data: ListType = {}
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
          id: linkId,
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

  /**
   * 影视详情，数据格式化
   * @param htmlString - 页面数据
   */
  async movieFormat(htmlString: string) {
    const relations: Record<string, string> = {
      'IMDb': 'imdb',

      '上映日期': 'release_date',
      '主演': 'actors',
      '制片国家/地区': 'countries',
      '又名': 'alias',
      '导演': 'directors',
      '片名': 'title',
      '片长': 'duration',
      '单集片长': 'episode_duration',
      '首播': 'first_date',
      '简介': 'summary',
      '类型': 'genres',
      '编剧': 'writers',
      '评分': 'rating',
      '评分人数': 'rateNumber',
      '语言': 'languages',
      '集数': 'episodes',
    }
    const data: Record<string, string | number> = {}
    try {
      const $ = cheerio.load(htmlString)
      const elArr = $('#wrapper > #content .subjectwrap .subject #info').first().contents().toString().trim().split('<br>')

      if (!elArr.length)
        return

      elArr.forEach((item) => {
        const $item = cheerio.load(item)
        const key = $item('.pl').first().text().replace(/:|：/, '')
        if (!key)
          return

        let value: any
        if (/主演/.test(key)) {
          const tempList = $item('.attrs a[rel="v:starring"]')
          const actors: string[] = []
          tempList.each(function () {
            actors.push($(this).text())
          })
          value = actors
        }
        if (/IMDb|又名|制片国家|语言|集数|单集片长/.test(key)) {
          const tempString = item.trim().replace(/^\<span.*\>.*\<\/span\>/, '').trim()
          const tempArr = tempString.split('/')
          if (tempArr.length > 1)
            value = tempArr.map(tempItem => tempItem.trim())
          else
            value = tempString
        }
        if (/类型/.test(key)) {
          const tempList = $item('span[property="v:genre"]')
          const temp: string[] = []
          tempList.each(function () {
            temp.push($item(this).text())
          })
          value = temp
        }
        if (!value && $item('.pl').next() && !/官方网站/.test(key)) {
          const tempString = $item('.pl').next().text()
          const tempArr = tempString.split('/')
          if (tempArr.length > 1)
            value = tempArr.map(tempItem => tempItem.trim())
        }
        if (!value && $item('.pl').next())
          value = $item('.pl').next().text()

        if (/类型|制片国家|导演|语言|编剧|又名/.test(key)) {
          if (!isArray(value))
            value = [value]
        }

        data[key] = value
      })
      const title = $('#wrapper > #content > h1 span[property="v:itemreviewed"]').first().text()
      const rateDom = $('#wrapper > #content .subjectwrap > #interest_sectl')
      const rating = rateDom.find('strong.rating_num').first().text()
      const rateNumber = parseInt(rateDom.find('a.rating_people > span[property="v:votes"]').first().text())
      const summary = $('#wrapper > #content .article .related-info .indent > span[property="v:summary"]').first().text().trim()
      Object.assign(data, { 片名: title, 评分: rating, 评分人数: rateNumber, 简介: summary })

      const dealData: any = {}

      const rKeys = Object.keys(relations)
      rKeys.forEach((rKey) => {
        if (!data[rKey])
          return
        dealData[relations[rKey]] = {
          name: rKey,
          value: data[rKey],
        }
      })
      return dealData
    }
    catch (e) {
      return data
    }
  }

  /**
   * 影视详情（格式化后数据）
   * @param id - douban id
   */
  async movie(id: string | number) {
    try {
      const htmlString = await this.html('movie', id)
      if (!htmlString)
        return {}
      return this.movieFormat(htmlString)
    }
    catch (e) {
      return {}
    }
  }

  /**
   * 影视搜索
   * @param keyword - 关键字
   */
  async movieSearch(keyword: string) {
    if (!keyword)
      return false

    await this.getCookie()

    const url = `https://movie.${this.baseUrl}/j/subject_suggest`

    const query = {
      q: keyword,
    }
    const options: any = {
      url,
      params: query,
      headers: {
        Cookie: this.cookieStr,
        UserAgent: this.userAgent,
      },
      method: 'GET',
      responseType: 'text',
      timeout: 10000,
      maxRedirects: 5,
    }
    try {
      const html = await customRequest(options)
      if (!html)
        return false
      return html.data as string
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log('>>> services >> douban > movieSearch', e)
      Logger.error('douban', 'movieSearch error', {
        options,
      })
      return false
    }
  }

  // ========== 读书 ==========

  /**
   * 书籍详情，数据格式化
   * @param htmlString - 页面数据
   */
  async bookFormat(htmlString: string) {
    const relations: Record<string, string> = {
      ISBN: 'isbn',

      书名: 'title',
      作者: 'authors',
      出版社: 'publishers',
      出品方: 'producers',
      原作名: 'origin_title',
      译者: 'translators',
      出版年: 'release_date',
      页数: 'page_num',
      定价: 'price',
      装帧: 'binding',
      简介: 'summary',
      评分: 'rating',
      评分人数: 'rateNumber',
    }
    const data: Record<string, string | number> = {}
    try {
      const $ = cheerio.load(htmlString)
      const elArr = $('#wrapper .subjectwrap .subject #info').first().contents().toString().trim().split('<br>')

      if (!elArr.length)
        return

      elArr.forEach((item) => {
        const $item = cheerio.load(item)
        const key = $item('.pl').first().text().replace(/:|：/, '').trim()
        if (!key)
          return

        let value: any
        if (/作者|出版社|出品方|译者/.test(key)) {
          const tempList = $item('a')
          const tempItems: string[] = []
          tempList.each(function () {
            tempItems.push($(this).text())
          })
          value = tempItems
        }

        if (/原作名|出版年|页数|定价|装帧|ISBN/.test(key)) {
          const tempString = item.trim().replace(/^\<span.*\>.*\<\/span\>/, '').trim()
          const tempArr = tempString.split('/')
          if (tempArr.length > 1)
            value = tempArr.map(tempItem => tempItem.trim())
          else
            value = tempString
        }

        if (!value && $item('.pl').next())
          value = $item('.pl').next().text()

        data[key] = value
      })

      const title = $('#wrapper h1 span[property="v:itemreviewed"]').first().text()
      const rateDom = $('#wrapper > #content .subjectwrap > #interest_sectl')
      const rating = rateDom.find('strong.rating_num').first().text()
      const rateNumber = parseInt(rateDom.find('a.rating_people > span[property="v:votes"]').first().text())
      const summary = $('#wrapper .indent .intro').text().trim()
      Object.assign(data, { 书名: title, 评分: rating, 评分人数: rateNumber, 简介: summary })

      const dealData: any = {}

      const rKeys = Object.keys(relations)
      rKeys.forEach((rKey) => {
        if (!data[rKey])
          return
        dealData[relations[rKey]] = {
          name: rKey,
          value: data[rKey],
        }
      })
      return dealData
    }
    catch (e) {
      return data
    }
  }

  /**
   * 书籍详情（格式化后数据）
   * @param id - douban id
   */
  async book(id: string | number) {
    try {
      const htmlString = await this.html('book', id)
      if (!htmlString)
        return {}
      return this.bookFormat(htmlString)
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log('>>> services >> douban > book', e)
      return {}
    }
  }

  /**
   * 书籍列表，数据格式化
   * @param htmlString - 页面数据
   */
  async bookListFormat(htmlString: string) {
    // eslint-disable-next-line no-console
    console.log('bookListFormat', htmlString)

    const items: ItemType[] = []
    const data: ListType = {}
    try {
      const $ = cheerio.load(htmlString)
      const itemElements = $('#wrapper .article .subject-item')
      if (!itemElements.length)
        return data

      for (let i = 0; i < itemElements.length; i++) {
        const item = itemElements[i]

        const infoDom = $(item).find('.info')
        const picDom = $(item).find('.pic')
        const titleDom = $(infoDom).find('h2 a')
        const linkDom = $(picDom).find('a')
        const dateDom = $(infoDom).find('.short-note .date')
        const rateDom = $(infoDom).find('.short-note span[class^="rat"]')
        const picSrcDom = $(picDom).find('a > img')
        const commentDom = $(infoDom).find('.short-note .comment')

        const titleValue = $(titleDom).text().trim()
        const linkValue = $(linkDom).attr('href')
        const dateValue = $(dateDom).text().replace(/\s|在读|读过|想读/gi, '')
        const picSrcValue = $(picSrcDom).attr('src')
        const commentValue = $(commentDom).text().trim()

        let rateValue
        if (rateDom) {
          const tempValue = $(rateDom).attr('class')
          if (tempValue)
            rateValue = parseInt(tempValue.replace(/\D/gi, ''))
          else
            rateValue = ''
        }

        const linkArray = linkValue?.split('/')
        const linkId = linkArray?.[linkArray.length - 2]

        items.push({
          id: linkId,
          title: titleValue,
          link: linkValue,
          date: dateValue,
          pic: picSrcValue,
          comment: commentValue,
          rate: rateValue,
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

  /**
   * 定时任务
   */
  async schedule() {
    try {
      const wishRes = await Subject.syncDouban('increment', { type: 'movie', status: 'wish', startPage: 1, endPage: 1 })
      const doRes = await Subject.syncDouban('increment', { type: 'movie', status: 'do', startPage: 1, endPage: 1 })
      const collectRes = await Subject.syncDouban('increment', { type: 'movie', status: 'collect', startPage: 1, endPage: 1 })

      const bookWishRes = await Subject.syncDouban('increment', { type: 'book', status: 'wish', startPage: 1, endPage: 1 })
      const bookDoRes = await Subject.syncDouban('increment', { type: 'book', status: 'do', startPage: 1, endPage: 1 })
      const bookCollectRes = await Subject.syncDouban('increment', { type: 'book', status: 'collect', startPage: 1, endPage: 1 })

      // TODO: 处理修改标记的数据，比如从想看到再看，从再看到一看

      const res = {
        movie: {
          do: !!doRes,
          wish: !!wishRes,
          collect: !!collectRes,
        },
        book: {
          do: !!bookWishRes,
          wish: !!bookDoRes,
          collect: !!bookCollectRes,
        },
      }
      Logger.info(`${this.name}_schedule`, `定时任务：${JSON.stringify(res)}`, {})
      return res
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log('>>> services >> douban > schedule', e)
      Logger.error(`${this.name}_schedule`, `定时任务失败：${String(e)}`, {})
      return false
    }
  }
}

export default new Douban()
