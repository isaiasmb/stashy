import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

export async function getBudgetItems(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/budget-items/:budgetId',
    {
      schema: {
        tags: ['Budget Items'],
        summary: 'Get all budget items',
        security: [{ bearerAuth: [] }],
        params: z.object({
          budgetId: z.string(),
        }),
        response: {
          200: z.object({
            budgetItems: z.array(
              z.object({
                id: z.string().uuid(),
                budgetId: z.string().uuid(),
                planned: z.number(),
                actual: z.number(),
                category: z.object({
                  id: z.string(),
                  title: z.string(),
                  type: z.enum(['EXPENSE', 'INCOME']),
                }),
              }),
            ),
          }),
        },
      },
    },
    async (request) => {
      const { budgetId } = request.params

      const budget = await prisma.budget.findUnique({
        where: { id: budgetId },
      })

      if (!budget) {
        throw new BadRequestError('Budget does not exists.')
      }

      const budgetItems = await prisma.budgetItem.findMany({
        where: {
          budgetId: budget.id,
        },
        select: {
          id: true,
          budgetId: true,
          actual: true,
          planned: true,
          category: {
            select: {
              id: true,
              title: true,
              type: true,
            },
          },
        },
      })

      if (!budgetItems.length) {
        throw new BadRequestError('Budget does not have any item.')
      }

      const transactions = await prisma.transaction.findMany({
        where: {
          date: {
            gte: budget.startDate,
            lte: budget.endDate,
          },
        },
        select: {
          amount: true,
          category: {
            select: {
              id: true,
            },
          },
        },
      })

      if (!transactions.length) {
        throw new BadRequestError(
          'No transactions were recorded during this period.',
        )
      }

      const budgetItemsWithTransactions = budgetItems.map((budgetItem) => {
        const itemTransactions = transactions.filter(
          (transaction) => transaction.category.id === budgetItem.category.id,
        )

        itemTransactions.forEach((itemTransaction) => {
          budgetItem.actual += itemTransaction.amount
        })

        return budgetItem
      })

      return { budgetItems: budgetItemsWithTransactions }
    },
  )
}
