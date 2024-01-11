import { env } from '@/env'
import { PromptTypes, ResponseTypes } from '@/utils/enums'
import Elysia from 'elysia'

export const authorize = new Elysia().get('/authorize', ({ set }) => {
  const authorizeUrl = new URL('/api/oauth2/authorize', 'https://discord.com')

  authorizeUrl.searchParams.set('response_type', ResponseTypes.Code)
  authorizeUrl.searchParams.set('client_id', env.DISCORD_CLIENT_ID)
  authorizeUrl.searchParams.set('client_secret', env.DISCORD_CLIENT_SECRET)
  authorizeUrl.searchParams.set('redirect_uri', env.DISCORD_CLIENT_REDIRECT_URI)
  authorizeUrl.searchParams.set('scope', ['identify', 'guilds'].join(' '))
  authorizeUrl.searchParams.set('prompt', PromptTypes.Consent)

  set.redirect = authorizeUrl.toString()
})
