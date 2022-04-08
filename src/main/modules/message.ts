import { ipcMain } from "electron"
import { getStatus } from "~/main/services/status"

export function sendRendererMessage(type: string, data: any) {
  const message = {
    type,
    data,
  }
  global.win?.webContents.send('message', message)
}


export function messageDeal() {
  const messages = new Map([
    ['get-status', getStatus()]
  ])
  messages.forEach((value, key) => {
    ipcMain.handle(key, async(event, data) => {
      return await value
    })
  })
}