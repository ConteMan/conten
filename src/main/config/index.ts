import { ConfigEnum } from './enum'

export interface DB {
  url: string
  selected?: boolean
}

export interface ConfigDetail {
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

export interface Config {
  [ConfigEnum.DEFAULT_NAME]: ConfigDetail
}

export const config: Config = {
  [ConfigEnum.DEFAULT_NAME]: {
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
