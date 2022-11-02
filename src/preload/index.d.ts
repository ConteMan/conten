import { ElectronAPI } from '@electron-toolkit/preload'
import type { shell } from 'electron'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    shell: shell
  }
}
