import { KEYS } from '@main/enums/scheduleEnum'
interface ScheduleListItem {
  name: string
  key: string
  module?: string
}

export const ScheduleList: ScheduleListItem[] = [
  {
    name: 'WakaTime',
    key: KEYS.WAKATIME,
  },
  {
    name: '天气',
    key: KEYS.WEATHER,
  },
  {
    name: '任务清理',
    key: KEYS.TASK_CLEAN,
  },
  {
    name: '豆瓣 - 影音书同步',
    key: KEYS.DOUBAN,
  },
  {
    name: 'V2EX',
    key: KEYS.V2EX,
  },
  {
    name: 'TapTap',
    key: KEYS.TAPTAP,
  },
  {
    name: '资讯 - Libvio',
    key: KEYS.INFO_LIBVIO,
  },
  {
    name: '资讯 - 足球',
    key: KEYS.INFO_FOOTBALL,
  },
]
