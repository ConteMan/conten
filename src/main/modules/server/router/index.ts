import Router from '@koa/router'

const router = new Router()

router.post('/extension', async (ctx) => {
  const { type } = ctx.request.body
  ctx.body = type
})

export default router
