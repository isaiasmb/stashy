import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { prisma } from '@/lib/prisma'

export async function createBudget(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/budgets',
    {
      schema: {
        tags: ['Budget'],
        summary: 'Create a new budget',
        security: [{ bearerAuth: [] }],
        body: z.object({
          name: z.string().nullable(),
          startDate: z.coerce.date(),
          endDate: z.coerce.date(),
          userId: z.string(),
          budgetItems: z.array(
            z.object({
              planned: z.number(),
              categoryId: z.string(),
            }),
          ),
        }),
        response: {
          201: z.object({
            budgetId: z.string().uuid(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { name, startDate, endDate, userId, budgetItems } = request.body

      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new BadRequestError('User does not exists.')
      }

      const budget = await prisma.budget.create({
        data: {
          name: name || '',
          startDate,
          endDate,
          userId,
        },
      })

      const budgetItemsToCreate = budgetItems.map((budgetItem) => ({
        planned: budgetItem.planned,
        actual: 0,
        userId,
        categoryId: budgetItem.categoryId,
        budgetId: budget.id,
      }))

      await prisma.budgetItem.createMany({
        data: budgetItemsToCreate,
      })

      return reply.status(201).send({
        budgetId: budget.id,
      })
    },
  )
}
