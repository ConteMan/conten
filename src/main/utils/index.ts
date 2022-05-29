import os from 'os'

export function is(val: unknown, type: string) {
  return toString.call(val) === `[object ${type}]`
}

export function isObject(val: any): val is Record<any, any> {
  return val !== null && is(val, 'Object')
}

/**
 * 生成随机字符串
 *
 * @param {Number} length - 长度
 * @param {String} chars - 指定字符范围
 * @return {String} - 随机字符串
 */
export function randomStr(length: number, chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ') {
  let result = ''

  for (let i = length; i > 0; i--)
    result += chars[Math.floor(Math.random() * chars.length)]

  return result
}

/**
 * 是否为 Windows7 之后系统
 */
export function isWin7() {
  return os.release().startsWith('6.1')
}

/**
 * 重试适配器
 * @param adapter - 适配器
 * @param options - 重试选项
 */
export function retryAdapterEnhancer(adapter: any, options = { times: 0, delay: 300 }) {
  const { times, delay } = options

  return async (config: any) => {
    const { retryTimes = times, retryDelay = delay } = config
    let __retryCount = 0
    const request: any = async () => {
      try {
        return await adapter(config)
      }
      catch (err) {
        if (!retryTimes || __retryCount >= retryTimes)
          return Promise.reject(err)

        __retryCount++
        // 延时处理
        const delay = new Promise((resolve) => {
          setTimeout(() => {
            resolve(true)
          }, retryDelay)
        })
        // 重新发起请求
        return delay.then(() => {
          return request()
        })
      }
    }
    return request()
  }
}
