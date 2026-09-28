// server/api/v1/journal-entries/[id]/index.delete.ts
import { prisma } from '~/server/utils/prisma'
import { getUserId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const userId = await getUserId(event)
  const id = Number(getRouterParam(event, 'id'))

  // Cascading delete sudah terpasang di schema.prisma
  return await prisma.journalEntries.delete({
    where: {
      Id: id,
      UserId: userId,
    },
  })
})
