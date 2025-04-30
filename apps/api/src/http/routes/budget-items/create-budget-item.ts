import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { prisma } from '@/lib/prisma'

export async function createBudgetItem(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/budget-items',
    {
      schema: {
        tags: ['Budget items'],
        summary: 'Create a new budget item',
        security: [{ bearerAuth: [] }],
        body: z.object({
          planned: z.number(),
          userId: z.string(),
          categoryId: z.string(),
          budgetId: z.string(),
        }),
        response: {
          201: z.object({
            budgetItemId: z.string().uuid(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { planned, userId, categoryId, budgetId } = request.body

      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new BadRequestError('User does not exists.')
      }

      const budget = await prisma.budget.findUnique({
        where: { id: budgetId },
      })

      if (!budget) {
        throw new BadRequestError('Budget does not exists.')
      }

      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      })

      if (!category) {
        throw new BadRequestError('Category does not exists.')
      }

      const budgetItem = await prisma.budgetItem.create({
        data: {
          planned,
          actual: 0,
          userId,
          categoryId,
          budgetId,
        },
      })

      return reply.status(201).send({
        budgetItemId: budgetItem.id,
      })
    },
  )
}
