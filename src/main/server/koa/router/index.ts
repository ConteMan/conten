import Router from '@koa/router'
import Extension from '../controller/extension'

const router = new Router()

router.post('/extension', async (ctx) => {
  const res = await Extension.add(ctx)
  ctx.body = res
})

export default router
