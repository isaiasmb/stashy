import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

export async function getUser(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/users/:userId',
    {
      schema: {
        tags: ['Users'],
        summary: 'Get an users',
        security: [{ bearerAuth: [] }],
        params: z.object({
          userId: z.string().uuid(),
        }),
        response: {
          200: z.object({
            user: z.object({
              id: z.string().uuid(),
              email: z.string().email(),
              avatarUrl: z.string().nullable(),
              createdAt: z.date(),
            }),
          }),
        },
      },
    },
    async (request) => {
      const { userId } = request.params

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          email: true,
          avatarUrl: true,
          createdAt: true,
        },
      })

      if (!user) {
        throw new BadRequestError('User not found')
      }

      return { user }
    },
  )
}
