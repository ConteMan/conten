import type { Axios as AxiosType } from 'axios'
import { retryAdapterEnhancer } from '@main/utils'
import { getConfigsByGroup } from '@main/services/config'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Axios = require('axios').default

export async function customRequest(options: any) {
  try {
    const { times = 3, delay = 1000 } = options
    const axiosInstance: AxiosType = Axios.create({
      adapter: retryAdapterEnhancer(Axios.defaults.adapter, {
        times,
        delay,
      }),
    })

    delete options?.times
    delete options?.delay

    const { proxy = false } = options
    if (proxy) {
      const res = await getConfigsByGroup('system', 'value')
      if (res?.system_proxy_protocol && res?.system_proxy_host && res?.system_proxy_port) {
        options.proxy = {
          protocol: res.system_proxy_protocol,
          host: res.system_proxy_host,
          port: res.system_proxy_port,
        }
      }
      else {
        delete options.proxy
      }
    }

    const { decode = '' } = options
    delete options.decode

    const res = await axiosInstance.request(options)

    if (['GKB', 'GB2312'].includes(decode)) {
      const utf8decoder = new TextDecoder(decode)
      const decodeBody = utf8decoder.decode(res.data)
      res.data = decodeBody
      return res
    }
    else {
      return res
    }
  }
  catch (e) {
    // eslint-disable-next-line no-console
    console.log('>>> utils >> request > customRequest', e)
    return false
  }
}
