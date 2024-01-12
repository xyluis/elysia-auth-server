import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { health } from './routes/health'
import { authorize } from './routes/authorize'
import { callback } from './routes/callback'
import { check } from './routes/check'
import { signOut } from './routes/sign-out'
import { env } from '@/env'
import { authCookie } from './auth-cookie'

const app = new Elysia()
  .use(
    cors({
      credentials: true,
      allowedHeaders: ['content-type', 'authorization'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
      origin: (request): boolean => {
        const origin = request.headers.get('origin')

        if (!origin) {
          return false
        }

        return true
      },
    }),
  )
  .use(authCookie)
  .use(health)
  .group('/api/v1', (app) => {
    return app.use(authorize).use(callback).use(check).use(signOut)
  })

app.listen(env.PORT)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
)
