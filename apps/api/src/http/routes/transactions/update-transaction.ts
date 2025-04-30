import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

export async function updateTransaction(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    '/transactions/:transactionId',
    {
      schema: {
        tags: ['Transactions'],
        summary: 'Update a transaction',
        security: [{ bearerAuth: [] }],
        params: z.object({
          transactionId: z.string().uuid(),
        }),
        body: z.object({
          amount: z.number().nullish(),
          description: z.string().nullish(),
          categoryId: z.string().nullish(),
          userId: z.string().nullish(),
          type: z.enum(['EXPENSE', 'INCOME']).nullish(),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { transactionId } = request.params

      const transaction = await prisma.transaction.findUnique({
        where: {
          id: transactionId,
        },
      })

      if (!transaction) {
        throw new BadRequestError('Transaction not found')
      }

      const bodyTransaction = request.body

      const newTransaction = {
        ...transaction,
        ...bodyTransaction,
      } as typeof transaction

      await prisma.transaction.update({
        where: {
          id: transactionId,
        },
        data: newTransaction,
      })

      return reply.status(204).send()
    },
  )
}
