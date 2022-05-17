import { getHttpData, viewWindowInit } from '~/main/modules/window'
import RequestCache from '~/main/services/requestCache'

export enum METHODS {
  PROFILE = 'profile',
  DETAIL_LIST = 'detail_list',
}

class TapTap {
  private module = 'taptap'
  private url = 'https://www.taptap.com'

  /**
   * 个人信息
   * @param {refresh} boolean - 是否刷新数据
   */
  async profile(refresh = false) {
    const data = await RequestCache.get(`${this.module}-${METHODS.PROFILE}`, !refresh)
    return data
  }

  /**
   * 详情
   * @param {refresh} boolean - 是否刷新数据
   */
  async detail(refresh = false) {
    const data = await RequestCache.get(`${this.module}-${METHODS.DETAIL_LIST}`, !refresh)
    return data
  }

  /**
   * 通过 View 请求调试获取数据
   */
  getViewHttpData(url = this.url) {
    try {
      const winInfo = viewWindowInit(url, true, true, { width: 1000, height: 0 })

      if (winInfo && winInfo.view && winInfo.win) {
        getHttpData(winInfo.view, {
          url: `^${this.url}`,
          mineType: 'application/json',
        }, async (req, res) => {
          const requestUrl = req.response.url
          // eslint-disable-next-line no-console
          console.log('requestUrl', requestUrl)

          const data = JSON.parse(res.body)

          // profile
          if (/.*\/mine.*/.test(requestUrl)) {
            if (data.success)
              await RequestCache.set(`${this.module}-${METHODS.PROFILE}`, data)
          }

          // detail_list
          if (/.*sidebar\/v1\/list.*/.test(requestUrl)) {
            if (data.success)
              await RequestCache.set(`${this.module}-${METHODS.DETAIL_LIST}`, data)
          }
        })
      }
      return winInfo
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log('>>> getViewHttpData', e)
      return false
    }
  }
}

export default new TapTap()
