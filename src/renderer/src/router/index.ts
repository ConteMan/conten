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
    component: () => import('../views/subject/List.vue'),
    meta: { title: '', keepAlive: false },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
