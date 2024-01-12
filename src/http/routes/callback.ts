import Elysia, { t } from 'elysia'
import { CallbackError } from './errors/callback-error'
import { env } from '@/env'
import { CallbackStatus } from '@/utils/enums'
import { getDiscordAccessToken, getDiscordUserData } from '@/utils/discord'
import { authCookie } from '../auth-cookie'

export const callback = new Elysia()
  .use(authCookie)
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
      /* const callbackRedirectUrl = new URL(
        '/api/v1/callback',
        env.CLIENT_BASE_URI,
      ) */

      if (!code && error && error_description) {
        authRedirectUrl.searchParams.append('status', CallbackStatus.Fail)
        authRedirectUrl.searchParams.append('error', error)

        set.redirect = authRedirectUrl.toString()
      }

      if (code) {
        const authData = await getDiscordAccessToken(code)

        const userData = await getDiscordUserData(
          authData.token_type,
          authData.access_token,
        )

        console.log(userData)

        /* if (!userData.verified) {
          throw new CallbackError(
            'Discord Access',
            'Please, verify your account',
          )
        } */

        /* const { token, expiration } =  */ await signUser(
          {
            sub: userData.id,
            username: userData.username,
            avatar: userData.avatar,
            displayName: userData.global_name,
          },
          authData.expires_in,
        )

        /* callbackRedirectUrl.searchParams.append('token', token)
        callbackRedirectUrl.searchParams.append(
          'expiration',
          expiration.toString(),
        ) */

        authRedirectUrl.searchParams.append('status', CallbackStatus.Success)

        set.redirect = authRedirectUrl.toString()
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
