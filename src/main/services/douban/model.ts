export interface formValueType {
  douban_enable: number
  douban_schedule: string
  douban_schedule_enable: number
  douban_id: string
}

export const formValueDefault: formValueType = {
  douban_enable: 0,
  douban_schedule: '',
  douban_schedule_enable: 0,
  douban_id: '',
}
