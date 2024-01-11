import Elysia, { t } from 'elysia'
import { CallbackError } from './errors/callback-error'
import { env } from '@/env'
import { CallbackStatus } from '@/utils/enums'
import { authentication } from '../authentication'
import { getDiscordAccessToken, getDiscordUserData } from '@/utils/discord'

export const callback = new Elysia()
  .use(authentication)
  .error({
    CALLBACK_ERROR: CallbackError,
  })
  .onError(({ code, error, set }) => {
    switch (code) {
      case 'CALLBACK_ERROR':
        set.status = 500
        return { code, message: error.message }
    }
  })
  .get(
    '/callback',
    async ({ query, set, signUser }) => {
      const { code, error, error_description } = query
      const authRedirectUrl = new URL('/api/v1/auth', env.CLIENT_BASE_URI)
      const callbackRedirectUrl = new URL(
        '/api/v1/callback',
        env.CLIENT_BASE_URI,
      )

      if (!code && error && error_description) {
        authRedirectUrl.searchParams.append('status', CallbackStatus.Fail)
        authRedirectUrl.searchParams.append('error', error)

        set.redirect = authRedirectUrl.toString()
      }

      if (code) {
        const data = await getDiscordAccessToken(code)

        const userData = await getDiscordUserData(
          data.token_type,
          data.access_token,
        )

        const { token, expiration } = await signUser(
          {
            sub: userData.id,
            username: userData.username,
            avatar: userData.avatar,
            displayName: userData.global_name,
          },
          data.expires_in,
        )

        callbackRedirectUrl.searchParams.append('token', token)
        callbackRedirectUrl.searchParams.append(
          'expiration',
          expiration.toString(),
        )

        set.redirect = callbackRedirectUrl.toString()
      }
    },
    {
      query: t.Object({
        code: t.Optional(t.String()),
        error: t.Optional(t.String()),
        error_description: t.Optional(t.String()),
      }),
    },
  )
