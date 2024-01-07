import Elysia, { t } from 'elysia'
import { CallbackError } from './errors/callback-error'
import { env } from '@/env'
import { CallbackStatus, GrantTypes } from '@/utils/enums'
import { authentication } from '../authentication'

const baseURL = 'https://discord.com/api/v10'

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
      const clientRedirectUri = new URL('/api/v1/callback', env.CLIENT_BASE_URI)

      if (!code && error && error_description) {
        clientRedirectUri.searchParams.append('status', CallbackStatus.Fail)
        clientRedirectUri.searchParams.append('error', error)

        set.redirect = clientRedirectUri.toString()
      }

      if (code) {
        const bodyParams = new URLSearchParams({
          grant_type: GrantTypes.AuthorizationCode,
          client_id: env.DISCORD_CLIENT_ID,
          client_secret: env.DISCORD_CLIENT_SECRET,
          code,
          redirect_uri: env.DISCORD_CLIENT_REDIRECT_URI,
        })

        const response = await fetch(`${baseURL}/oauth2/token`, {
          method: 'POST',
          body: bodyParams.toString(),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })

        const data = (await response.json()) as any

        console.log(data)

        if (data.error) {
          throw new CallbackError(data.error, data.error_description)
        }

        const userResponse = await fetch(`${baseURL}/users/@me`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${data.token_type} ${data.access_token}`,
          },
        })

        const userData = (await userResponse.json()) as any

        console.log(userData)

        await signUser({
          sub: userData.id,
          username: userData.username,
        })

        clientRedirectUri.searchParams.append('status', CallbackStatus.Success)

        set.redirect = clientRedirectUri.toString()
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
