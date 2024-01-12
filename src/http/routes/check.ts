import Elysia from 'elysia'
import { getUserAvatarUrl } from '@/utils/discord'
import { authCookie } from '../auth-cookie'

export const check = new Elysia()
  .use(authCookie)
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
