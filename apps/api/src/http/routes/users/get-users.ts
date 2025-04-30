import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

export async function getUsers(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/users',
    {
      schema: {
        tags: ['Users'],
        summary: 'Get all users',
        security: [{ bearerAuth: [] }],
        response: {
          200: z.object({
            users: z.array(
              z.object({
                id: z.string().uuid(),
                email: z.string().email(),
                avatarUrl: z.string().nullable(),
                createdAt: z.date(),
              }),
            ),
          }),
        },
      },
    },
    async () => {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          avatarUrl: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return { users }
    },
  )
}
