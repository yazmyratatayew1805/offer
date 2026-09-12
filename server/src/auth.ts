import type { FastifyReply, FastifyRequest } from 'fastify'

export function getAdminToken(): string {
  return process.env.ADMIN_TOKEN || 'change-me-to-a-long-random-string'
}

export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const header = request.headers['x-admin-token']
  const auth = request.headers.authorization
  const token =
    (typeof header === 'string' && header) ||
    (typeof auth === 'string' && auth.startsWith('Bearer ') ? auth.slice(7) : '')

  if (!token || token !== getAdminToken()) {
    await reply.code(401).send({ error: 'Unauthorized' })
  }
}
