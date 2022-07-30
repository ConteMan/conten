import * as cheerio from 'cheerio'

interface Options {
  tid: number
  [name: string]: string | number
}

/**
 * 格式化
 * @param html - 页面
 */
export async function format(html: string, options: Options) {
  try {
    const { tid } = options
    const $ = cheerio.load(html, { decodeEntities: false })

    const list: any = []
    const items = $('.sub01_c table.tab01').first().find('tbody tr')

    items.each(function (i) {
      if (!i)
        return

      const time = $(this).find('td').first().text().trim()
      const name = $(this).find('td').first().next().text().trim()
      const home_team = $(this).find('td a').first().text().trim()
      const home_team_url = $(this).find('td a').first().attr('href')
      const home_team_id = home_team_url?.replace('http://match.sports.sina.com.cn/football/team.php?id=', '')
      const score = $(this).find('td.fred').first().text().trim()
      const visiting_team = $(this).find('td a').last().text().trim()
      const visiting_team_url = $(this).find('td a').last().attr('href')
      const visiting_team_id = visiting_team_url?.replace('http://match.sports.sina.com.cn/football/team.php?id=', '')
      const status = $(this).find('td .sta').first().attr('class')?.replace('sta', '').trim()

      list.push({
        tid,
        time,
        name,
        home_team,
        home_team_url,
        home_team_id: home_team_id ? parseInt(home_team_id) : 0,
        score,
        visiting_team,
        visiting_team_url,
        visiting_team_id: visiting_team_id ? parseInt(visiting_team_id) : 0,
        status,
      })
    })
    return list
  }
  catch (e) {
    return false
  }
}
