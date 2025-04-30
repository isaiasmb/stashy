import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

export async function getTransactions(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/transactions',
    {
      schema: {
        tags: ['Transactions'],
        summary: 'Get all transactions',
        security: [{ bearerAuth: [] }],
        response: {
          200: z.object({
            transactions: z.array(
              z.object({
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
            ),
          }),
        },
      },
    },
    async () => {
      const transactions = await prisma.transaction.findMany({
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
        orderBy: {
          createdAt: 'desc',
        },
      })

      return { transactions }
    },
  )
}
