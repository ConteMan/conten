export interface formValueType {
  wakatime_api_key: string
  wakatime_schedule: string
  wakatime_schedule_enable: number
}

export const formValueDefault: formValueType = {
  wakatime_api_key: '',
  wakatime_schedule: '',
  wakatime_schedule_enable: 1,
}
