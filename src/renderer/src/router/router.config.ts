import type { RouteRecordRaw } from 'vue-router'
import LayoutBase from '../layout/Base.vue'

export const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Root',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/dashboard/Dashboard.vue'),
    meta: { title: '', keepAlive: false },
  },
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
  {
    path: '/status',
    name: 'Status',
    component: () => import('../views/status/Status.vue'),
    meta: { title: '', keepAlive: true },
  },
]
