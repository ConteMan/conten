export const ipcApi = async (data: {
  name: string
  args?: any
}) => {
  return await window.electron.ipcRenderer.invoke('api', data)
}
