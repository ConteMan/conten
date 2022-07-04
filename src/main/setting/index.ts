import WakaTime from '@main/services/wakatime'
import { schedule as WeatherSchedule } from '@main/services/weather'

interface ScheduleListItem {
  name: string
  key: string
  function: any
}

export const ScheduleList: ScheduleListItem[] = [
  {
    name: 'WakaTime 基础',
    key: 'wakatime_base',
    function: WakaTime.schedule(),
  },
  {
    name: '天气',
    key: 'weather',
    function: WeatherSchedule(),
  },
]
