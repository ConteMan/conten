import Router from '@koa/router'
import Extension from '../controller/extension'

const router = new Router()

router.post('/extension', async (ctx) => {
  const { type } = ctx.request.body

  let res
  switch (type) {
    case 'libvio': {
      res = await Extension.libvio(ctx)
      break
    }
    default: {
      res = await Extension.add(ctx)
      break
    }
  }
  ctx.body = res
})

export default router
