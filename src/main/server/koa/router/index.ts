import Router from '@koa/router'
import { transform } from '../controller/transform'
import { status } from '../controller/status'

function logToRender(data: any) {
  global.win?.webContents.send('indexMsg', { type: 'log', data })
}

const router = new Router()

router.post('/transform', async (ctx) => {
  const res = await transform(ctx.request.body)
  logToRender({ res })
  ctx.body = res
})

router.get('/status', async (ctx) => {
  const res = await status()
  logToRender({ res })
  ctx.body = res
})

export default router
