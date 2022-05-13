import { viewWindowInit } from '~/main/modules/window'
import { isObject } from '~/main/utils'

async function execScript(scriptStr = '') {
  try {
    if (!scriptStr)
      return false

    const url = 'https://juejin.cn'
    await viewWindowInit(url)
    const res = await global.wins.view.getBrowserView()?.webContents.executeJavaScript(scriptStr, true)
    return isObject(res) ? JSON.stringify(res) : res
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
