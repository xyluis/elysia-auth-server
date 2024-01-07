import Elysia from 'elysia'
import { authentication } from '../authentication'

export const check = new Elysia()
  .use(authentication)
  .get('/check', async ({ getCurrentUser }) => {
    const { sub, username } = await getCurrentUser()

    return {
      decoded: {
        id: sub,
        username,
      },
    }
  })
