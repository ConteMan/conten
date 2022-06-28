export interface formValueType {
  system_schedule: string
  system_schedule_enable: number
  system_proxy_protocol: string
  system_proxy_host: string
  system_proxy_port: string
}

export const formValueDefault: formValueType = {
  system_schedule: '',
  system_schedule_enable: 1,
  system_proxy_protocol: 'http',
  system_proxy_host: '',
  system_proxy_port: '',

}
