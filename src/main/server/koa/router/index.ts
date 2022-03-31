import Router from "@koa/router"
import { transform } from '../controller/transform'

function logToRender(data: any) {
  global.win?.webContents.send('indexMsg', { type: 'log', data })
}

const router = new Router()

router.post('/transform', async (ctx, next) => {
  const res = await transform(ctx.request.body)
  logToRender({ res })
  ctx.body = res
})

export default router