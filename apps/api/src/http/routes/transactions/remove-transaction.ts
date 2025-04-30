import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

export async function removeTransaction(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/transactions/:transactionId',
    {
      schema: {
        tags: ['Transactions'],
        summary: 'Remove a transaction',
        security: [{ bearerAuth: [] }],
        params: z.object({
          transactionId: z.string().uuid(),
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

      await prisma.transaction.delete({
        where: {
          id: transactionId,
        },
      })

      return reply.status(204).send()
    },
  )
}
