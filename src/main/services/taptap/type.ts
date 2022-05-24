export interface formValueType {
  taptap_enable: number
  taptap_schedule: string
  taptap_schedule_enable: number
  taptap_user_id: string
}

export const formValueDefault: formValueType = {
  taptap_enable: 0,
  taptap_schedule: '',
  taptap_schedule_enable: 1,
  taptap_user_id: '',
}
