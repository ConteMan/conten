import type { BrowserWindow } from 'electron'
import type { PrismaClient } from '@prisma/client'

declare global {
  var win: BrowserWindow | null
  var prisma: PrismaClient | null
}
