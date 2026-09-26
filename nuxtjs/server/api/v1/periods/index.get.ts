import { prisma } from '~~/server/utils/prisma'
import { getUserId } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const userId = await getUserId(event)
  const periods = await prisma.periods.findMany({
    where: { UserId: userId },
    orderBy: { StartDate: 'desc' }
  })
  return periods
})
