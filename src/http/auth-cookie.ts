import Elysia, { Static, t } from 'elysia'
import { cookie } from '@elysiajs/cookie'
import { jwt } from '@elysiajs/jwt'
import { env } from '@/env'
import { UnauthorizedError } from './routes/errors/unauthorized-error'

const jwtPayloadSchema = t.Object({
  sub: t.String(),
  username: t.String(),
  displayName: t.Union([t.Null(), t.Optional(t.String())]),
  avatar: t.Union([t.Null(), t.Optional(t.String())]),
})

export const authCookie = new Elysia()
  .error({
    UNAUTHORIZED: UnauthorizedError,
  })
  .onError(({ code, error, set }) => {
    switch (code) {
      case 'UNAUTHORIZED':
        set.status = 401
        return { code, message: error.message }
    }
  })
  .use(
    jwt({
      name: 'jwt',
      secret: env.JWT_SECRET_KEY,
      schema: jwtPayloadSchema,
    }),
  )
  .use(cookie())
  .derive(({ jwt, cookie, setCookie, removeCookie, set }) => {
    return {
      getCurrentUser: async () => {
        if (!cookie.auth) {
          throw new UnauthorizedError()
        }

        console.log(cookie.auth)

        const payload = await jwt.verify(cookie.auth)

        if (!payload) {
          throw new UnauthorizedError()
        }

        return payload
      },
      signUser: async (
        payload: Static<typeof jwtPayloadSchema>,
        expiration: number,
      ) => {
        const jwtToken = await jwt.sign({
          ...payload,
          exp: expiration,
        })

        setCookie('auth', jwtToken, {
          httpOnly: true,
          maxAge: expiration,
          path: '/',
        })
      },
      signOut: () => {
        console.log(cookie)
        removeCookie('auth')
        console.log(set.headers)
      },
    }
  })
