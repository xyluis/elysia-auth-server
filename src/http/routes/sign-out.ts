import Elysia from 'elysia'
import { authentication } from '../authentication'

export const signOut = new Elysia()
  .use(authentication)
  .post('/sign-out', ({ signOut, set }) => {
    signOut()

    set.status = 200
  })
