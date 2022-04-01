import type { BrowserWindow } from 'electron'
import type { PrismaClient } from '@prisma/client'
import type ElectronStore from 'electron-store'

declare global {
  var win: BrowserWindow | null
  var prisma: PrismaClient | null
  var store: Record<string, Record<string, any>> | null
}
