import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'stdout',
      level: 'error',
    },
    {
      emit: 'stdout',
      level: 'info',
    },
    {
      emit: 'stdout',
      level: 'warn',
    },
  ],
})

prisma.$on('query', e => {
  console.log("Query: " + e.query)
  console.log("Duration: " + e.duration + "ms")
  try{
    throw new Error()
  } catch (e) {
    console.log('stack', (e as Error).stack)
  }
})

// A `main` function so that you can use async/await
async function main() {
  // ... you will write your Prisma Client queries here

  let resp = await Promise.all([
    prisma.user.findUnique({
      where: {
        id: 1
      }
    }),
    prisma.user.findUnique({
      where: {
        id: 2
      }
    })
  ])
  console.dir(resp, { depth: null })

  let resp2 =  await Promise.all([
    prisma.user.findFirst({
      where: {
        id: 1
      }
    }),
    prisma.user.findFirst({
      where: {
        id: 2
      }
    })
  ])
  console.dir(resp2, { depth: null })
}

main()
  .catch(e => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
