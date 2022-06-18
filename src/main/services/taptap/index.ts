import MD5 from 'crypto-js/md5'
import { METHODS, TASK_STATUS } from '@main/enums/taptapEnum'
import { getHttpData, viewWindowInit } from '@main/modules/window'
import RequestCache from '@main/services/requestCache'
import { addTask, updateTask } from '@main/services/task'
import { getConfigByKey } from '@main/services/config'

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
   * @param {url} string - 请求地址
   */
  async getViewHttpData(url = this.url) {
    try {
      const winInfo = viewWindowInit(url, true, true, { width: 1000, height: 0 })

      if (winInfo && winInfo.view && winInfo.win) {
        const current_time = new Date().getTime()
        const EXEC_TIMEOUT = 60
        const taskName = `${this.module}-getViewHttpData-${current_time}-${MD5(url)}`
        const expired_at = new Date(current_time + EXEC_TIMEOUT * 1000)
        await addTask(taskName, {
          detail: {},
          view_name: winInfo.name,
          window_name: winInfo.name,
          expired_at,
        })

        // TODO 可以拆分
        await getHttpData(winInfo.view, {
          url: `^${this.url}`,
          mineType: 'application/json',
        }, async (req, res) => {
          const requestUrl = req.response.url
          // eslint-disable-next-line no-console
          console.log('requestUrl', requestUrl)

          const data = JSON.parse(res.body)

          // // profile
          // if (/.*\/mine.*/.test(requestUrl)) {
          //   if (data.success)
          //     await RequestCache.set(`${this.module}-${METHODS.PROFILE}`, data)
          // }

          // detail_list
          if (/.*sidebar\/v1\/list\?type=user_detail.*/.test(requestUrl)) {
            if (data.success) {
              await RequestCache.set(`${this.module}-${METHODS.DETAIL_LIST}`, data)
              await updateTask(taskName, {
                status: TASK_STATUS.SUCCESS,
                end_at: new Date(),
              })
              await global.wins?.[winInfo.name].close()
            }
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

  /**
   * 定时任务
   */
  async schedule() {
    try {
      const userId = await getConfigByKey('taptap_user_id') // TODO KEY 应该统一管理
      if (userId) {
        const url = `https://www.taptap.com/user/${userId.value}/most-played`
        await this.getViewHttpData(url)
      }
      return true
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log('>>> taptap schedule', e)
      return false
    }
  }
}

export default new TapTap()
