import Elysia from 'elysia'
import { authentication } from '../authentication'
import { getUserAvatarUrl } from '@/utils/discord'

export const check = new Elysia()
  .use(authentication)
  .get('/check', async ({ getCurrentUser }) => {
    const { sub, username, avatar, displayName } = await getCurrentUser()

    return {
      decoded: {
        id: sub,
        username,
        displayName,
        avatarURL: getUserAvatarUrl(sub, avatar),
      },
    }
  })
