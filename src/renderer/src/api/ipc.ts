export async function ipcApi(data: {
  name: string
  args?: any
}) {
  return await window.electron.ipcRenderer.invoke('api', data)
}
