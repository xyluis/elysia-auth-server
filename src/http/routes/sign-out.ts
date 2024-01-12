import Elysia from 'elysia'
import { authCookie } from '../auth-cookie'

export const signOut = new Elysia()
  .use(authCookie)
  .post('/sign-out', ({ signOut }) => {
    signOut()
  })
