import { getServerSession } from '#auth'
import { createError } from 'h3'

export async function requireAdmin(event: any) {
  const session = await getServerSession(event)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  if (!session.user.isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
  return session
}
