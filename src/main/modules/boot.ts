import { app } from 'electron'
import { isWin7 } from '@main/utils'

import '@main/modules/sqlite3'

if (isWin7())
  app.disableHardwareAcceleration()

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}
