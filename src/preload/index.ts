import { clipboard, contextBridge, ipcRenderer, shell } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

import type {
  PreloadBackColorOptions,
  PreloadOptions,
  PreloadSizeOptions,
  PreloadStatusOptions,
  PreloadUrlOptions,
} from './type'

// `exposeInMainWorld` can not detect `prototype` attribute and methods, manually patch it.
function withPrototype(obj: Record<string, any>) {
  const protos = Object.getPrototypeOf(obj)

  for (const [key, value] of Object.entries(protos)) {
    if (Object.prototype.hasOwnProperty.call(obj, key))
      continue

    if (typeof value === 'function') {
      // Some native API not work in Renderer-process, like `NodeJS.EventEmitter['on']`. Wrap a function patch it.
      obj[key] = function (...args: any) {
        return value.call(obj, ...args)
      }
    }
    else {
      obj[key] = value
    }
  }
  return obj
}

// Custom APIs for renderer
const api = {
  openWin: (option: PreloadUrlOptions) => ipcRenderer.send('openWin', option),
  changWindowSize: (option: PreloadSizeOptions) => ipcRenderer.send('changWindowSize', option),
  WindowSizeAlter: (option: PreloadStatusOptions) => {
    // eslint-disable-next-line no-console
    console.log(option)
    ipcRenderer.send('WindowSizeAlter', option)
  },
  WindowAppMinimize: (option: PreloadOptions) => ipcRenderer.send('appMinimize', option),
  WindowMinSize: (option: PreloadSizeOptions) => ipcRenderer.send('windowMinSize', option),
  CenterWindow: (option: PreloadOptions) => ipcRenderer.send('centerWindow', option),
  WindowAppQuit: (option: PreloadOptions) => ipcRenderer.send('appQuit', option),
  setBackgroundColor: (option: PreloadBackColorOptions) =>
    ipcRenderer.send('setBackgroundColor', option),
  clipboardWriteText: (text: string) => clipboard.writeText(text),
  on: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => ipcRenderer.on(channel, listener),
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('shell', withPrototype(shell))
  }
  catch (error) {
    console.error(error)
  }
}
else {
  // @ts-expect-error (define in dts)
  window.electron = electronAPI
  // @ts-expect-error (define in dts)
  window.api = api
  // @ts-expect-error (define in dts)
  window.shell = withPrototype(shell)
}
