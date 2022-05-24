export interface formValueType {
  taptap_enable: number
  taptap_schedule: string
  taptap_schedule_enable: number
}

export const formValueDefault: formValueType = {
  taptap_enable: 0,
  taptap_schedule: '',
  taptap_schedule_enable: 1,
}
