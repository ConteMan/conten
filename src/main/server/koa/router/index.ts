import Router from '@koa/router'
import { transform } from '../controller/transform'
import { status } from '../controller/status'

const router = new Router()

router.post('/transform', async (ctx) => {
  const res = await transform(ctx.request.body)
  ctx.body = res
})

router.get('/status', async (ctx) => {
  const res = await status()
  ctx.body = res
})

export default router
