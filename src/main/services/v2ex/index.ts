import * as cheerio from 'cheerio'
import dayjs from 'dayjs'

import { getConfigByKey, mergeConfig } from '@main/services/config'
import { viewWindowInit } from '@main/modules/window'
import { bulkCreateOrUpdate } from '@main/services/info'
import { retryAdapterEnhancer } from '@main/utils'
import { sendToRenderer } from '@main/utils/ipcMessage'
import { addLog } from '../log'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Axios = require('axios').default

class V2EX {
  private name: string
  public moduleKey = 'v2ex_module'
  public siteUrl = 'https://www.v2ex.com'

  constructor() {
    this.name = 'v2ex'
  }

  /**
   * 登录检测
   */
  async loginCheck(request = false) {
    try {
      if (request) {
        const login = await this.requestSetting()
        const { cookieStr } = login || { cookieStr: '' }
        await mergeConfig({
          group_key: this.name,
          key: this.moduleKey,
          value: {
            login: !!login,
            cookieStr,
          },
        })
        return !!login
      }
      else {
        const moduleInfo = await getConfigByKey(this.moduleKey)
        if (!moduleInfo)
          return false

        const { login } = moduleInfo.value ? JSON.parse(moduleInfo.value) : { login: false }
        return !!login
      }
    }
    catch (e) {
      return false
    }
  }

  /**
   * 请求设置页，页面内容（可以请求到，则已登录）
   */
  async requestSetting() {
    try {
      const url = `${this.siteUrl}/settings`
      const winInfo = await viewWindowInit(url, false, true, { width: 1000, height: 100 })
      if (winInfo && winInfo.name && winInfo.view) {
        const cookies = await winInfo.win.getBrowserView()?.webContents.session.cookies.get({ url: this.siteUrl })
        let cookieStr = ''
        cookies?.forEach((item) => {
          cookieStr += `${item.name}=${item.value};`
        })
        await global.wins?.[winInfo.name].close()

        const axiosInstance = Axios.create({
          adapter: retryAdapterEnhancer(Axios.defaults.adapter, {
            times: 3,
            delay: 1000,
          }),
        })

        const res = await axiosInstance.request({
          url,
          headers: {
            Cookie: cookieStr,
          },
          method: 'GET',
          responseType: 'text',
          timeout: 10000,
          maxRedirects: 5,
        })
        return res ? { data: res.data, cookieStr } : false
      }
      return false
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log('>>> requestSetting', e)
      return false
    }
  }

  /**
   * 获取页面数据
   */
  async getPage(url = this.siteUrl, auth = true) {
    try {
      let cookieStr = ''
      if (auth) {
        const moduleInfo = await getConfigByKey(this.moduleKey)
        const moduleValue = JSON.parse(moduleInfo.value)
        cookieStr = moduleValue.cookieStr || ''
        if (!cookieStr)
          return null
      }

      const options = {
        url,
        method: 'GET',
        responseType: 'text',
        timeout: 10000,
        maxRedirects: 20,
      }

      if (cookieStr) {
        Object.assign(options, {
          headers: {
            Cookie: cookieStr,
          },
        })
      }
      const axiosInstance = Axios.create({
        adapter: retryAdapterEnhancer(Axios.defaults.adapter, {
          times: 3,
          delay: 1000,
        }),
      })
      const res = await axiosInstance.request(options)
      return res ? { data: res.data } : null
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log('>>> getPage', e)
      return null
    }
  }

  /**
   * 获取用户名
   * @param request - 是否进行远程请求
   */
  async getUsername(request = false) {
    try {
      if (!request) {
        const moduleInfo = await getConfigByKey(this.moduleKey)
        const moduleValue = JSON.parse(moduleInfo.value)
        const { username } = moduleValue || { username: '' }
        return username || null
      }

      const mainPageStr = await this.getPage(`${this.siteUrl}/`)
      if (!mainPageStr)
        return null

      const $ = cheerio.load(mainPageStr.data)
      const aDoms = $('#Top .tools a')

      const username = aDoms.length > 0 && aDoms.eq(1).attr('href') ? aDoms.eq(1).attr('href') as string : null

      if (username) {
        await mergeConfig({
          group_key: this.name,
          key: this.moduleKey,
          value: {
            username,
          },
        })
      }

      return username
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log('>>> getUsername', e)
      return null
    }
  }

  /**
   * 获取用户信息
   * @param request - 是否进行远程请求
   */
  async getUser(request = false) {
    try {
      if (!request) {
        const moduleInfo = await getConfigByKey(this.moduleKey)
        const moduleValue = JSON.parse(moduleInfo.value)
        const { user } = moduleValue || { user: '' }
        return user || null
      }

      const username = await this.getUsername()
      if (!username)
        return null
      const url = `${this.siteUrl}${username}`
      const mainPageStr = await this.getPage(url)
      if (!mainPageStr)
        return null

      const $ = cheerio.load(mainPageStr.data)
      const mainDom = $('#Main')

      const idHtml = mainDom.find('span.gray').first().text()
      const id = idHtml?.match(/V2EX 第 ([0-9]+?) 号会员/)?.[1]
      const created = idHtml?.match(/加入于 (.+?) /)?.[1]
      const dau = mainDom.find('span.gray a').first().html()
      const online = mainDom.find('strong.online').first().text()
      const balanceHtml = mainDom.find('div.balance_area').first().html()
      const balanceArray = [...String(balanceHtml).matchAll(/\s?([0-9]+?)\s\</g)]
      const balance = {
        gold: balanceArray[0][1],
        silver: balanceArray[1][1],
        bronze: balanceArray[2][1],
      }
      const showName = username.split('/')?.[2]
      const signature = mainDom.find('.bigger').first().text()

      const user = {
        id,
        created,
        dau,
        online,
        balance,
        showName,
        signature,
      }
      if (id) {
        await mergeConfig({
          group_key: this.name,
          key: this.moduleKey,
          value: {
            user,
          },
        })
      }

      return id ? user : null
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log('>>> getUser', e)
      return null
    }
  }

  /**
   * 获取节点列表
   * @param tab - 节点
   */
  async getTabList(tab = 'hot') {
    try {
      const tabs = ['hot', 'all', 'tech', 'creative', 'play', 'apple', 'r2', 'members', 'qna', 'city', 'deals', 'jobs']
      if (!tabs.includes(tab))
        return null

      const url = `${this.siteUrl}/?tab=${tab}`
      const pageRes = await this.getPage(url)
      if (!pageRes)
        return null

      const $ = cheerio.load(pageRes.data)

      const mainDom = $('#Main')
      const list: any[] = []
      const moduleName = this.name
      mainDom.find('.cell.item').each(function () {
        const title = $(this).find('.item_title a').first().text()
        const title_link = $(this).find('.item_title a').first().attr('href')
        const id = Number(title_link?.match(/\/t\/([0-9]+)/)?.[1])
        const node = $(this).find('.topic_info > .node').first().text()
        const node_link = $(this).find('.topic_info > .node').first().attr('href')
        const author = $(this).find('.topic_info strong a').first().html()
        const author_link = $(this).find('.topic_info strong a').first().attr('href')
        const last_reply_at = $(this).find('.topic_info span').first().attr('title')
        const reply_count = Number($(this).find('td[align=right] a').first().html())

        const slug = `${moduleName}_${tab}_${id}`
        const data = {
          id,
          title,
          title_link,
          node,
          node_link,
          author,
          author_link,
          last_reply_at,
          reply_count,
        }

        list.push(
          {
            platform: moduleName,
            platform_type: `${moduleName}-${tab}`,
            slug,
            info_at: dayjs(last_reply_at),
            data,
          })
      })
      if (list.length)
        await bulkCreateOrUpdate(list)
      return list
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log('>>> getTabList', e)
      return null
    }
  }

  /**
   * 定时任务
   */
  async schedule() {
    try {
      const loginRes = await this.loginCheck(true)
      const getUsernameRes = await this.getUsername(true)
      const getUserRes = await this.getUser(true)
      const getTabListRes = await this.getTabList()

      sendToRenderer('refresh', {
        module: this.name,
      })

      const res = {
        login: !!loginRes,
        getUsername: !!getUsernameRes,
        getUser: !!getUserRes,
        getTabList: !!getTabListRes,
      }
      addLog(`${this.name}_schedule`, `定时任务：${JSON.stringify(res)}`, {})
      return res
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log('>>> v2ex schedule', e)
      addLog(`${this.name}_schedule`, `定时任务失败：${String(e)}`, {})
      return false
    }
  }
}

export default new V2EX()
