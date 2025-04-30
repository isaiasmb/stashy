import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

export async function getBudget(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/budgets/:budgetId',
    {
      schema: {
        tags: ['Budgets'],
        summary: 'Get a budget',
        security: [{ bearerAuth: [] }],
        params: z.object({
          budgetId: z.string().uuid(),
        }),
        response: {
          200: z.object({
            budget: z.object({
              id: z.string().uuid(),
              name: z.string(),
              startDate: z.date(),
              endDate: z.date(),
            }),
          }),
        },
      },
    },
    async (request) => {
      const { budgetId } = request.params

      const budget = await prisma.budget.findUnique({
        where: {
          id: budgetId,
        },
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
        },
      })

      if (!budget) {
        throw new BadRequestError('Budget not found')
      }

      return { budget }
    },
  )
}
