import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function seed() {
  await prisma.transaction.deleteMany()
  await prisma.user.deleteMany()
  await prisma.category.deleteMany()

  const passwordHash = await hash('123456', 1)

  await prisma.user.create({
    data: {
      name: 'Isaias',
      email: 'isaiasbuscarino@hotmail.com',
      avatarUrl: 'https://github.com/isaiasmb.png',
      passwordHash,
    },
  })

  await prisma.user.create({
    data: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      avatarUrl: faker.image.avatarGitHub(),
      passwordHash,
    },
  })

  await prisma.category.create({
    data: {
      title: 'Aluguel',
      type: 'EXPENSE',
    },
  })

  await prisma.category.create({
    data: {
      title: 'Supermercado',
      type: 'EXPENSE',
    },
  })

  await prisma.category.create({
    data: {
      title: 'Seguro Carro',
      type: 'EXPENSE',
    },
  })

  await prisma.category.create({
    data: {
      title: 'Farmácia e Exames',
      type: 'EXPENSE',
    },
  })

  await prisma.category.create({
    data: {
      title: 'Plano de celular',
      type: 'EXPENSE',
    },
  })

  await prisma.category.create({
    data: {
      title: 'Salario',
      type: 'INCOME',
    },
  })
}

seed().then(() => {
  console.log('Database seeded!')
})
