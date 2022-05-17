import { viewWindowInit } from '~/main/modules/window'
import { isObject } from '~/main/utils'

async function execScript(scriptStr = '') {
  try {
    if (!scriptStr)
      return false

    const url = 'https://juejin.cn'
    const winInfo = await viewWindowInit(url)
    if (winInfo && winInfo.view) {
      const res = await winInfo.view.webContents.executeJavaScript(scriptStr, true)
      return isObject(res) ? JSON.stringify(res) : res
    }
    return false
  }
  catch (e) {
    // eslint-disable-next-line no-console
    console.log('>>> run-script-in-view-window', e)
    return false
  }
}

/**
 * 签到
 */
async function checkIn() {
  const checkIn = `
    fetch('https://api.juejin.cn/growth_api/v1/check_in', {
      headers: {
        cookie: document.cookie,
      },
      method: 'POST',
      credentials: 'include',
    }).then(resp => resp.json())
  `
  return await execScript(checkIn.toString())
}

export { execScript, checkIn }
