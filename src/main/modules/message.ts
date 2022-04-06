export function sendRendererMessage(type: string, data: any) {
  const message = {
    type,
    data,
  }
  global.win?.webContents.send('message', message)
}