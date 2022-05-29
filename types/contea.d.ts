declare namespace Contea {

  /**
   * Window
   */

  // 窗口大小
  interface Bounds {
    width: number
    height: number
  }

  // 请求规则
  interface HttpDataRule {
    url: string
    mineType: string
  }

  /**
   * Config
   */

  // 数据库配置
  interface DB {
    url: string
    selected?: boolean
  }

  // 配置详情
  interface ConfigDetail {
    app: {
      name: string
      themeWithSystem: boolean
      isTop: boolean
    }
    server: {
      port: number | string
    }
    db: {
      sqlite3: {
        path: string
      }
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
  type Config = Record<string, ConfigDetail>
}
