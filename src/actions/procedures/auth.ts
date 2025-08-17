import { InvalidCredentialsError } from '@inspetor/errors/invalid-credentials-error'
import { auth } from '@inspetor/lib/auth/authjs'
import { createServerActionProcedure } from 'zsa'

export const authProcedure = createServerActionProcedure().handler(async () => {
  const session = await auth()

  if (!session) {
    throw new InvalidCredentialsError()
  }

  return {
    user: session.user,
  }
})
