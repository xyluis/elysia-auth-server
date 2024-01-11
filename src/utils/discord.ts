import {
  RESTGetAPICurrentUserResult,
  RESTPostOAuth2AccessTokenResult,
} from 'discord-api-types/v10'

import { CallbackError } from '@/http/routes/errors/callback-error'
import { DefaultAvatars, discordApiBaseURL } from './constants'
import { GrantTypes } from './enums'
import { env } from '@/env'

export async function getDiscordAccessToken(code: string) {
  const bodyParams = new URLSearchParams({
    grant_type: GrantTypes.AuthorizationCode,
    client_id: env.DISCORD_CLIENT_ID,
    client_secret: env.DISCORD_CLIENT_SECRET,
    code,
    redirect_uri: env.DISCORD_CLIENT_REDIRECT_URI,
  })

  const response = await fetch(`${discordApiBaseURL}/oauth2/token`, {
    method: 'POST',
    body: bodyParams,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  if (!response.ok) {
    throw new CallbackError(
      'Discord OAuth token',
      `Failed to fetch Discord OAuth token: [${response.status}] ${response.statusText}`,
    )
  }

  const data = (await response.json()) as RESTPostOAuth2AccessTokenResult

  return data
}

export async function getDiscordUserData(tokenType: string, token: string) {
  const response = await fetch(`${discordApiBaseURL}/users/@me`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${tokenType} ${token}`,
    },
  })

  const data = (await response.json()) as RESTGetAPICurrentUserResult

  return data
}

export function getUserAvatarUrl(id: string, avatar: string | null) {
  const avatars = Object.keys(DefaultAvatars)
  const defaultAvatar =
    DefaultAvatars[avatars[(avatars.length * Math.random()) << 0]]

  const userDefaultAvatar = `https://discordapp.com/assets/${DefaultAvatars[defaultAvatar]}.png`

  const mimeType = avatar && avatar.startsWith('a_') ? 'gif' : 'png'

  return avatar
    ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.${mimeType}`
    : userDefaultAvatar
}
