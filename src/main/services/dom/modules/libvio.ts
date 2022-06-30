import * as cheerio from 'cheerio'
import { customRequest } from '@main/utils/request'

type libvioTypes = 'latest' | 'film' | 'tv' | 'anime' | 'kj' | 'om'

const url = 'https://www.libvio.me'

/**
 * 根据 ID 获取详情
 * @param id - 页面 ID
 */
export async function detail(id: number) {
  try {
    const requestUrl = `${url}/detail/${id}.html`

    const res = await customRequest({
      url: requestUrl,
    })

    if (!res)
      return false

    const $ = cheerio.load(res.data)
    const contentDom = $('.stui-content')

    const doubanUrl = contentDom.find('.stui-content__detail p a[href*=douban]').first().attr('href')
    const doubanId = doubanUrl?.replace('https://movie.douban.com/subject/', '').replace('/', '')
    const updatedAt = contentDom.find('.stui-content__detail p.data a').last().text()
    const details = contentDom.find('.stui-content__detail p.data')
    let detailStr = ''
    if (details.length > 0)
      detailStr = `${details.first().text()} /${details.first().next().text()}`
    return {
      douban: {
        url: doubanUrl,
        id: doubanId ? parseInt(doubanId) : 0,
      },
      detail: detailStr,
      updated_at: updatedAt,
    }
  }
  catch (e) {
    return false
  }
}

/**
 * 列表
 * @param options - 参数
 */
export async function list(options: any) {
  try {
    const { type = 'latest' }: { type: libvioTypes } = options

    const typeAllSelector = '.stui-pannel .stui-vodlist li .stui-vodlist__box'
    const typeRules: any = {
      latest: {
        url: '',
        allSelector: '.stui-pannel__bd > .stui-vodlist:first-child li .stui-vodlist__box',
      },
      film: {
        url: '/type/1.html',
        allSelector: typeAllSelector,
      },
      tv: {
        url: '/type/2.html',
        allSelector: typeAllSelector,
      },
      anime: {
        url: '/type/4.html',
        allSelector: typeAllSelector,
      },
      kj: {
        url: '/type/15.html',
        allSelector: typeAllSelector,
      },
      om: {
        url: '/type/16.html',
        allSelector: typeAllSelector,
      },
    }

    const requestUrl = `${url}${typeRules[type].url}`

    const res = await customRequest({
      url: requestUrl,
    })

    if (!res)
      return null

    const $ = cheerio.load(res.data)

    const list: any = []
    const items = $(typeRules[type].allSelector)
    items.each(function () {
      const title = $(this).find('a')?.first().attr('title')
      const url = $(this).find('a')?.first().attr('href')
      const id = url?.replace('/detail/', '').replace('.html', '').replace(/\//, '').trim()
      const pic_url = $(this).find('a')?.first().attr('data-original')
      const des = $(this).find('a span.pic-text')?.first().text()
      const tag = $(this).find('a span.pic-tag')?.first().text()

      list.push({
        title,
        url,
        id,
        pic_url,
        des,
        tag,
      })
    })

    if (list.length) {
      for (let i = 0; i < list.length; i++) {
        if (list[i].id) {
          const res = await detail(list[i].id)
          if (res)
            list[i] = { ...list[i], ...res }
        }
      }
    }

    return list
  }
  catch (e) {
    return false
  }
}

