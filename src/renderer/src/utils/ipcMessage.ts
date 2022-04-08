export const sendToMain = (type = '', data: any = null): void => {
  window.ipcRenderer.send('indexMsg', { type, data })
}

export const invokeToMain = async(type = '', data: any = null) => {
  return await window.ipcRenderer.invoke(type, data)
}
