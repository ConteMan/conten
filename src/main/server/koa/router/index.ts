import Router from '@koa/router'
import dayjs from 'dayjs'
import { sendToRenderer } from '@main/utils/ipcMessage'
import Extension from '../controller/extension'

const router = new Router()

router.post('/extension', async (ctx) => {
  const { type } = ctx.request.body

  sendToRenderer(
    'activity',
    {
      time: dayjs().format('DD HH:mm:ss'),
      type,
    },
  )

  let res
  switch (type) {
    case 'libvio':
    case 'ddrk': {
      res = await Extension.movie(ctx)
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
