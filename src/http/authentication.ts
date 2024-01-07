import Elysia, { Static, t } from 'elysia'
import { cookie } from '@elysiajs/cookie'
import { jwt } from '@elysiajs/jwt'
import { bearer } from '@elysiajs/bearer'
import { env } from '@/env'
import { UnauthorizedError } from './routes/errors/unauthorized-error'

const jwtPayloadSchema = t.Object({
  sub: t.String(),
  username: t.String(),
})

export const authentication = new Elysia()
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
  .use(bearer())
  .derive(({ jwt, bearer }) => {
    return {
      getCurrentUser: async () => {
        if (!bearer) {
          throw new UnauthorizedError()
        }

        const payload = await jwt.verify(bearer)

        if (!payload) {
          throw new UnauthorizedError()
        }

        return payload
      },
      signUser: async (
        payload: Static<typeof jwtPayloadSchema>,
        expiration: number,
      ) => {
        const jwtToken = await jwt.sign(payload)

        return { token: jwtToken, expiration }
      },
      signOut: () => {
        console.log('Sign Out')
      },
    }
  })
