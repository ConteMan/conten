export interface formValueType {
  v2ex_enable: number
  v2ex_schedule: string
  v2ex_schedule_enable: number
  v2ex_api_key: string
}

export const formValueDefault: formValueType = {
  v2ex_enable: 0,
  v2ex_schedule: '',
  v2ex_schedule_enable: 1,
  v2ex_api_key: '',
}
