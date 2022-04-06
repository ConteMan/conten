import type { RouteRecordRaw } from 'vue-router'
import LayoutBase from '../layout/Base.vue'

export const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Root',
    component: LayoutBase,
    redirect: '/test',
    children: [
      {
        path: '/test',
        name: 'Test',
        component: () => import('../views/test/Test.vue'),
        meta: { title: '', keepAlive: false },
      },
      {
        path: '/setting',
        name: 'Setting',
        component: () => import('../views/setting/Setting.vue'),
        meta: { title: '', keepAlive: false },
      },
    ],
  },
]
