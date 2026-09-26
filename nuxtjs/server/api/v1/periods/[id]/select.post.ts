import prisma from '~/server/utils/prisma'
import { getUserId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const userId = await getUserId(event)
  const id = Number(getRouterParam(event, 'id'))

  // PENTING: cuma boleh 1 yang selected per user
  await prisma.$transaction([
    prisma.periods.updateMany({
      where: { UserId: userId },
      data: { IsSelected: false }
    }),
    prisma.periods.update({
      where: { Id: id },
      data: { IsSelected: true }
    })
  ])

  return { success: true }
})
