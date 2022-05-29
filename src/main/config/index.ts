import { app } from 'electron'
import { ConfigEnum } from '@main/enums/configEnum'

/**
 * 应用原始配置
 */
export const CONFIG: Contea.Config = {
  [ConfigEnum.DEFAULT_NAME]: {
    app: {
      name: 'Contea',
      themeWithSystem: true,
      isTop: false,
    },
    server: {
      port: 3000,
    },
    db: {
      sqlite3: {
        path: app.getPath('userData'),
      },
      mongodb: [
        {
          url: '',
          selected: true,
        },
      ],
    },
    win: {
      bounds: {
        x: 0,
        y: 0,
        width: 800,
        height: 600,
      },
    },
  },
}
