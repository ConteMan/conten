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

    return await axiosInstance.request(options)
  }
  catch (e) {
    // eslint-disable-next-line no-console
    console.log('>>> utils >> request > customRequest', e)
    return false
  }
}
