export const sendToRenderer = (channel: string, data: any) => {
  global.win?.webContents.send(channel, data)
}
