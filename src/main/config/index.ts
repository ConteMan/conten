import { ConfigEnum } from './enum'

export interface DB {
  url: string
  selected?: boolean
}

export interface ConfigDetail {
  app: {
    name: string
    themeWithSystem: boolean
    isTop: boolean
  }
  server: {
    port: number | string
  }
  db: {
    mongodb: DB[] | []
  }
  win: {
    bounds: {
      x: number
      y: number
      width: number
      height: number
    }
  }
}

/**
 * 应用配置描述
 */
export interface Config {
  [ConfigEnum.DEFAULT_NAME]: ConfigDetail
}

/**
 * 应用原始配置
 */
export const CONFIG: Config = {
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
