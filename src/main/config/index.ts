import { ConfigEnum } from './enum'

export const config = {
  [ConfigEnum.DEFAULT_NAME]: {
    server: {
      port: 3000
    },
    db: {
      mongodb: {
        url: "mongodb://127.0.0.1:27017/contea_desktop?readPreference=primary&serverSelectionTimeoutMS=2000&ssl=false"
      }
    }
  }
}