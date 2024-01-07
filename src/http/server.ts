import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { authentication } from './authentication'
import { health } from './routes/health'
import { authorize } from './routes/authorize'
import { callback } from './routes/callback'
import { check } from './routes/check'
import { signOut } from './routes/sign-out'
import { env } from '@/env'

const app = new Elysia()
  .use(
    cors({
      credentials: true,
      allowedHeaders: ['content-type'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
      origin: (request): boolean => {
        const origin = request.headers.get('origin')

        if (!origin || origin !== 'http://localhost:3000') {
          return false
        }

        return true
      },
    }),
  )
  .use(authentication)
  .use(health)
  .group('/api/v1', (app) => {
    return app.use(authorize).use(callback).use(check).use(signOut)
  })

app.listen(env.PORT)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
)
