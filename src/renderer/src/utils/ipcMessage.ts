export const sendToRenderer = (type = '', data: any = null): void => {
  window.ipcRenderer.send('indexMsg', { type, data })
}
