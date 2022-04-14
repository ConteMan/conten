import { ConfigEnum } from './enum'

export interface DB {
  url: string
  selected?: boolean
}

export interface ConfigDetail {
  server: {
    port: number | string
  },
  db: {
    mongodb: DB[] | []
  }
}

export interface ExtensionCommandDetail {
  inbox: string[],
  doing: string[]
}

export interface Config {
  [ConfigEnum.DEFAULT_NAME]: ConfigDetail
  [ConfigEnum.EXTENSION_COMMAND]: ExtensionCommandDetail
}

export const config: Config = {
  [ConfigEnum.DEFAULT_NAME]: {
    server: {
      port: 3000
    },
    db: {
      mongodb: [
        {
        url: "mongodb://127.0.0.1:27017/contea_desktop?readPreference=primary&serverSelectionTimeoutMS=2000&ssl=false",
        selected: true
        },
      ],
    },
  },
  [ConfigEnum.EXTENSION_COMMAND]: {
    inbox: [],
    doing: [],
  }
}