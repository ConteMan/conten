export const NavList = [
  {
    name: '面板',
    path: '/dashboard',
    icon: 'mdi-view-dashboard-outline',
  },
  {
    name: '资讯',
    path: '/info',
    icon: 'mdi-newspaper-variant-outline',
  },
  {
    name: '条目',
    path: '/subject',
    icon: 'mdi-cube-outline',
  },
  {
    name: '模块',
    path: '/module',
    icon: 'mdi-apps',
  },
]

export const ModuleNavList = [
  {
    name: '实验',
    path: '/test',
  },
  {
    name: '设置',
    path: '/setting',
  },
  {
    name: '日志',
    path: '/log',
  },
  {
    name: '关于',
    path: '/about',
  },
]

export const SubjectType = [
  {
    name: '影视',
    value: 'movie',
  },
  {
    name: '图书',
    value: 'book',
  },
  {
    name: '音乐',
    value: 'music',
  },
]

export const SubjectStatus = [
  {
    name: '想看',
    value: 'wish',
  },
  {
    name: '在看',
    value: 'do',
  },
  {
    name: '已看',
    value: 'collect',
  },
]

export const InfoPlatform = [
  {
    name: 'V2EX',
    value: 'v2ex',
  },
  {
    name: '少数派',
    value: 'sspai',
  },
  {
    name: 'Libvio',
    value: 'libvio',
  },
]

export const ProxyProtocols = [
  {
    label: 'HTTP',
    value: 'http',
  },
  {
    label: 'HTTPS',
    value: 'https',
  },
]

export const ModuleSettingDefault = {
  douban_id: '',
  douban_cookie: '',
  wakatime_api_key: '',
  v2ex_api_key: '',
  taptap_user_id: '',
}
