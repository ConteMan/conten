import * as cheerio from 'cheerio'

/**
 * 列表格式化
 * @param html - 列表页面
 */
export async function listFormat(html: string, allSelector = '.post-box-list > .post-box') {
  try {
    const $ = cheerio.load(html)

    const list: any = []
    const items = $(allSelector)
    items.each(function () {
      const title = $(this).find('.post-box-text .post-box-title a')?.first().text().trim()
      const url = $(this).find('.post-box-text .post-box-title a')?.first().attr('href')
      const id = url?.replace('https://ddrk.me/', '').replace(/\//, '').trim()
      const pic_url = $(this).find('.post-box-image')?.first().attr('style')?.replace('background-image: url(', '').replace(');', '').trim()
      const des = $(this).find('.post-box-text p')?.first().text()
      const tagDoms = $(this).find('.post-box-meta a')
      const tag: any = []
      if (tagDoms.length) {
        tagDoms.each(() => {
          tag.push({
            name: $(this).text().trim(),
            url: $(this).attr('href')?.trim(),
          })
        })
      }

      list.push({
        title,
        url,
        id,
        pic_url,
        des,
        tag,
      })
    })
    return list
  }
  catch (e) {
    return false
  }
}
