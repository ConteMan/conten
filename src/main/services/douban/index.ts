import type { Options } from 'got'
import GOT from 'got'
import _, { isArray } from 'lodash'
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
   * 获取豆瓣电影数据列表
   * @param params - 参数
   */
  async movieList(params?: DoubanHtmlRequest) {
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

      const html = await this.listHtml(params)
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
  async listHtml(params: DoubanHtmlRequest) {
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
      return this.movieListFormat(htmlString)
    return false
  }

  /**
   * 电影列表数据格式化
   * @param htmlString - 页面数据
   */
  async movieListFormat(htmlString: string) {
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

  /**
   * 获取电影详情数据
   * @param id - douban id
   */
  async movie(id: string | number) {
    try {
      const htmlString = await this.html('movie', id)
      if (!htmlString)
        return {}
      return this.movieDataFormat(htmlString)
    }
    catch (e) {
      return {}
    }
  }

  /**
   * 获取详情页面数据
   * @param type - 类型，电影、读书
   * @param id - douban id
   */
  async html(type: string, id: string | number) {
    if (!id || !type)
      return false

    const cookie = `bid=${randomStr(12)}; ll="${randomStr(6, '123456789')}"`
    const url = `https://${type}.${this.baseurl}/subject/${id}/`

    const options: Options = {
      url,
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
   * 电影详情页面数据格式化
   * @param htmlString - 页面数据
   */
  async movieDataFormat(htmlString: string) {
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
}

export default new Douban()
