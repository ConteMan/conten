export const sendToMain = (type = '', data: any = null, process = 'indexMsg'): void => {
  window.ipcRenderer.send(process, { type, data })
}

export const invokeToMain = async(type = '', data: any = null) => {
  return await window.ipcRenderer.invoke(type, data)
}
