export interface formValueType {
  weather_enable: number
  weather_schedule: string
  weather_schedule_enable: number
}

export const formValueDefault: formValueType = {
  weather_enable: 1,
  weather_schedule: '',
  weather_schedule_enable: 1,
}
