import { viewWindowInit } from '~/main/modules/window'

async function execScript(scriptStr: string = '') {
  try {
    if (!scriptStr)
      return false
    
    await viewWindowInit()
    return await global.wins.view.getBrowserView()?.webContents.executeJavaScript(scriptStr, true)
  }
  catch(e) {
    console.log('>>> run-script-in-view-window', e)
    return false
  }
}

/**
 * 签到
 */
async function checkIn() {
  const scriptStr =  `
    fetch("https://api.juejin.cn/growth_api/v1/check_in", {
      headers: {
        cookie: document.cookie
      },
      method: 'POST',
      credentials: 'include'
    }).then(resp => resp.json())
  `
  return await execScript(scriptStr)
}

export { execScript, checkIn }
