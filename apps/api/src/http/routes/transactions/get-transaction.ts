import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

export async function getTransaction(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/transactions/:transactionId',
    {
      schema: {
        tags: ['Transactions'],
        summary: 'Get a transaction',
        security: [{ bearerAuth: [] }],
        params: z.object({
          transactionId: z.string().uuid(),
        }),
        response: {
          200: z.object({
            transaction: z.object({
              id: z.string().uuid(),
              amount: z.number(),
              description: z.string().nullable(),
              type: z.enum(['EXPENSE', 'INCOME']),
              userId: z.string(),
              category: z.object({
                id: z.string(),
                title: z.string(),
              }),
              createdAt: z.date(),
            }),
          }),
        },
      },
    },
    async (request) => {
      const { transactionId } = request.params

      const transaction = await prisma.transaction.findUnique({
        where: {
          id: transactionId,
        },
        select: {
          id: true,
          amount: true,
          description: true,
          type: true,
          userId: true,
          category: {
            select: {
              id: true,
              title: true,
            },
          },
          createdAt: true,
        },
      })

      if (!transaction) {
        throw new BadRequestError('Transaction not found')
      }

      return { transaction }
    },
  )
}
