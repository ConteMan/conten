export interface ScheduleModel {
  id: number
  name: string
  key: string
  crontab: string
  next_at: string
  last_at: string
  enable: string
}
