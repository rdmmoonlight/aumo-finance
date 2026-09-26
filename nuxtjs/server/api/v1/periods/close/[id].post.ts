import prisma from '~/server/utils/prisma'
import { getUserId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const userId = await getUserId(event)
  const id = Number(getRouterParam(event, 'id'))

  const closed = await prisma.periods.updateMany({
    where: { Id: id, UserId: userId },
    data: { IsClosed: true, IsSelected: false }
  })

  if (closed.count === 0) throw createError({ statusCode: 404, message: 'Period not found' })
  return { success: true }
})
