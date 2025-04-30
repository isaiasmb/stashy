import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import { env } from '@stashy/env'
import { fastify } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { errorHandler } from '@/http/error-handler'
import { createBudget } from '@/http/routes/budget/create-budget'
import { getBudget } from '@/http/routes/budget/get-budget'
import { createBudgetItem } from '@/http/routes/budget-items/create-budget-item'
import { getBudgetItems } from '@/http/routes/budget-items/get-budget-items'
import { createTransaction } from '@/http/routes/transactions/create-transaction'
import { getTransaction } from '@/http/routes/transactions/get-transaction'
import { getTransactions } from '@/http/routes/transactions/get-transactions'
import { removeTransaction } from '@/http/routes/transactions/remove-transaction'
import { updateTransaction } from '@/http/routes/transactions/update-transaction'
import { getUser } from '@/http/routes/users/get-user'
import { getUsers } from '@/http/routes/users/get-users'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.setErrorHandler(errorHandler)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Stashy',
      description: 'Full-stack SaaS Stashy',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUI, {
  routePrefix: '/docs',
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.register(fastifyCors)

app.register(getUsers)
app.register(getUser)

app.register(createTransaction)
app.register(getTransactions)
app.register(getTransaction)
app.register(removeTransaction)
app.register(updateTransaction)

app.register(createBudgetItem)
app.register(getBudgetItems)

app.register(createBudget)
app.register(getBudget)

app.listen({ port: env.SERVER_PORT }).then(() => {
  console.log('HTTP server routing!')
})
