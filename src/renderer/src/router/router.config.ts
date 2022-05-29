import type { RouteRecordRaw } from 'vue-router'

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
    path: '/about',
    name: 'About',
    component: () => import('../views/about/About.vue'),
    meta: { title: '', keepAlive: false },
  },
  {
    path: '/info',
    name: 'Info',
    component: () => import('../views/info/Info.vue'),
    meta: { title: '', keepAlive: false },
  },
]
