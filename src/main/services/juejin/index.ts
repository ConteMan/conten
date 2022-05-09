async function execScript() {
  try {
    const script = `
      fetch("https://api.juejin.cn/growth_api/v1/check_in", {
        headers: {
          cookie: document.cookie
        },
        method: 'POST',
        credentials: 'include'
      }).then(resp => resp.json())
    `
    const result = await global.wins.view.getBrowserView()?.webContents.executeJavaScript(script, true)
    return result
  }
  catch(e) {
    console.log('>>> run-script-in-view-window', e)
    return false
  }
}

export { execScript }
