import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Root',
    redirect: '/subject',
  },
  {
    path: '/subject',
    name: 'Subject',
    component: () => import('../views/subject/Subject.vue'),
    meta: {
      title: '条目',
      keepAlive: false,
      menu: true,
    },
  },
  {
    path: '/setting',
    name: 'Setting',
    component: () => import('../views/setting/Setting.vue'),
    meta: {
      title: '设置',
      keepAlive: false,
      menu: true,
    },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
