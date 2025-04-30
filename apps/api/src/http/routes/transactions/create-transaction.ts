import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { prisma } from '@/lib/prisma'

export async function createTransaction(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/transactions',
    {
      schema: {
        tags: ['Transactions'],
        summary: 'Create a new transaction',
        security: [{ bearerAuth: [] }],
        body: z.object({
          amount: z.number(),
          description: z.string().nullish(),
          categoryId: z.string(),
          userId: z.string(),
          date: z.coerce.date(),
        }),
        response: {
          201: z.object({
            transactionId: z.string().uuid(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { amount, description, userId, categoryId, date } = request.body

      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new BadRequestError('User does not exists.')
      }

      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      })

      if (!category) {
        throw new BadRequestError('Category does not exists.')
      }

      const transaction = await prisma.transaction.create({
        data: {
          amount,
          description,
          userId,
          categoryId,
          date,
          type: category.type,
        },
      })

      return reply.status(201).send({
        transactionId: transaction.id,
      })
    },
  )
}
