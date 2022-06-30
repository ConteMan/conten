export const invokeApi = async (data: {
  name: string
  data?: any
}) => {
  return await window.ipcRenderer.invoke('api', data)
}
